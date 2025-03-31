using System.Reflection;

namespace Server.Extensions
{
    public static class ParameterInfoExtension
    {
        /// <summary>
        /// Checks if parameter of function is nullable
        /// </summary>
        /// <param name="source">ParameterInfo object of function</param>
        /// <returns>True if underlying parameter is nullable, false if it is not</returns>
        public static bool IsNullable(this ParameterInfo source)
        {
            var nullabilityContext = new NullabilityInfoContext();
            var info = nullabilityContext.Create(source);

            return info.WriteState == NullabilityState.Nullable
                || info.ReadState == NullabilityState.Nullable;
        }
    }
}
