namespace Server.Extensions
{
    public static class StringExtension
    {
        /// <summary>
        /// Limits the string to a number of characters
        /// </summary>
        /// <param name="source">Source string</param>
        /// <param name="limit">Number of characters that string can have.</param>
        /// <returns>String that has at most the given number of characters</returns>
        public static string Limit(this string source, int limit)
        {
            return source.Length > limit ? source[..limit] : source;
        }
    }
}
