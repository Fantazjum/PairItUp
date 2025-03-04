using System.Reflection;

namespace Server.Extensions
{
    public static class ParameterInfoExtension
    {
        public static bool IsNullable(this ParameterInfo source)
        {
            var nullabilityContext = new NullabilityInfoContext();
            var info = nullabilityContext.Create(source);

            return info.WriteState == NullabilityState.Nullable
                || info.ReadState == NullabilityState.Nullable;
        }
    }
}
