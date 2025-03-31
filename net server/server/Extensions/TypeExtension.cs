using System.Reflection;
using System.Text.Json;

namespace Server.Extensions
{
    public static class TypeExtension
    {
        /// <summary>
        /// Checks if underlying object of JsonElement can be assigned to chosen type
        /// </summary>
        /// <param name="source">Underlying type to assign JsonElement to</param>
        /// <param name="element">JsonElement to be checked</param>
        /// <returns>True if JsonElement can be assigned to type, false otherwise.</returns>
        private static bool IsAssignableFromJsonElement(this Type source, JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    if (source.IsPrimitive || !(source.IsClass || source.IsValueType))
                    {
                        return false;
                    }
                    try
                    {
                        JsonSerializer.Deserialize(element, source);
                        return true;
                    }
                    catch
                    {
                        return false;
                    }
                case JsonValueKind.Array:
                    if (!source.IsArray)
                    {
                        return false;
                    }
                    try
                    {
                        JsonSerializer.Deserialize(element, source);
                        return true;
                    }
                    catch
                    {
                        return false;
                    }
                case JsonValueKind.String:
                    return source.IsAssignableFrom(typeof(String));
                case JsonValueKind.Number:
                    return element.GetRawText().Contains('.') 
                        ? source.IsAssignableFrom(typeof(float))
                        : source.IsAssignableFrom(typeof(int));
                case JsonValueKind.True:
                case JsonValueKind.False:
                    return source.IsAssignableFrom(typeof(bool));
                case JsonValueKind.Null:
                    return source.IsAssignableFrom(null);
                case JsonValueKind.Undefined:
                default:
                    return false;
            }
        }

        /// <summary>
        /// Tries to cast JsonElement to given type
        /// </summary>
        /// <param name="source">Underlying type to cast JsonElement to</param>
        /// <param name="element">JsonElement containing object to be cast</param>
        /// <returns>Cast object or null if object was null or the cast has failed</returns>
        public static object? AssignFromJsonElement(this Type source, JsonElement element)
        {
            try
            {
                return JsonSerializer.Deserialize(element, source);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Tries to get method data from given object, choosing method based on its name and arguments
        /// </summary>
        /// <param name="source">Element containing the method</param>
        /// <param name="methodName">Name of the method</param>
        /// <param name="args">Arguments of the method</param>
        /// <returns>MethodInfo of found method or null if it was not found</returns>
        public static MethodInfo? GetMethodByParams(this Type source, string methodName, object?[]? args)
        {
            var parameters = (args ?? []).Select(arg => arg?.GetType()).ToArray();
            var candidates = source.GetMethods(
              BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

            var methods = candidates.Where((method) => {
              if (method.Name != methodName)
                {
                    return false;
                }

                var methodParameters = method.GetParameters();
                if (methodParameters.Length < parameters.Length)
                {
                    return false;
                }

                int iterator = 0;
                for (iterator = 0; iterator < parameters.Length; iterator++)
                {
                    var methodParameterType = methodParameters[iterator].ParameterType;
                    var parameterType = parameters[iterator];
                    if (parameterType == typeof(JsonElement))
                    {
                        var element = (JsonElement)(args![iterator]!);
                        if (!methodParameterType.IsAssignableFromJsonElement(element))
                        {
                            return false;
                        }
                    }
                    else if (methodParameters[iterator].IsNullable())
                    {
                        if (parameterType != null && !methodParameterType.IsAssignableFrom(parameterType))
                        {
                            return false;
                        }
                    }
                    else if (!methodParameterType.IsAssignableFrom(parameterType))
                    {
                        return false;
                    }
                }
                for (_ = iterator; iterator < methodParameters.Length; iterator++)
                {
                    var methodParameter = methodParameters[iterator];
                    if (!(methodParameter.IsOptional || methodParameter.HasDefaultValue))
                    {
                        return false;
                    }
                }

                return true;
            });

            if (methods.Any())
            {
                var currentMethod = methods.First();
                var minCount = currentMethod.GetParameters().Length;
                foreach (var method in methods) 
                {
                    var methodParamCount = method.GetParameters().Length;
                    if (methodParamCount < minCount)
                    {
                        currentMethod = method;
                        minCount = methodParamCount;
                    }
                }

                return currentMethod;
            }

            return null;
        }
    }
}
