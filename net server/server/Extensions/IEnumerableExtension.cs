using System.Text.Json;

namespace Server.Extensions
{
    public static class IEnumerableExtension
    {
        public static List<object?> CastJsonElementsToTypes(this IEnumerable<object?> source, IEnumerable<Type> types)
        {
            List<object?> castList = [];
            for (int iterator = 0; iterator < source.Count(); iterator++)
            {
                var obj = source.ElementAt(iterator);
                if (obj?.GetType() == typeof(JsonElement))
                {
                    obj = types.ElementAt(iterator).AssignFromJsonElement((JsonElement)obj);
                }

                castList.Add(obj);
            }

            return castList;
        }
    }
}
