using System.Reflection;
using System.Text.Json;

namespace Server.Extensions
{
    public static class TypeExtension
    {
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
