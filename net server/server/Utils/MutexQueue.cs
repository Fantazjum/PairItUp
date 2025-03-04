using System.Collections.Concurrent;

namespace Server.Utils
{
    public class MutexQueue
    {
        /// <summary>
        /// Mutex for checking accessing/modyfing data
        /// </summary>
        private readonly Mutex _mutex = new(false);
        /// <summary>
        /// Queue of accessing object identifiers for the FIFO order
        /// </summary>
        public readonly ConcurrentQueue<string> _currentQueue = [];

        /// <summary>
        /// Wait for queue to be empty
        /// </summary>
        public void SyncAwaitAll()
        {
            while (!_currentQueue.IsEmpty)
            {
                continue;
            }
        }

        /// <summary>
        /// Tries to modify data synchronously, using FIFO queue
        /// </summary>
        /// <param name="id">Unique identifier for the queue</param>
        /// <param name="method">Method that modifies data once turn is reached</param>
        /// <param name="args">Arguments for the aformentioned method</param>
        public object? SyncModifyData(string id, Delegate method, params object?[]? args)
        {
            _currentQueue.Enqueue(id);

            while (_mutex.WaitOne())
            {
                if (_currentQueue.TryPeek(out var current) && current != id)
                {
                    _mutex.ReleaseMutex();
                    continue;
                }

               break;
            }

            _currentQueue.TryDequeue(out var _);

            var result = method.DynamicInvoke(args);

            _mutex.ReleaseMutex();

            return result;
        }
    }
}
