/**
 * bulkwebsearch.js
 * The websearch.js components will only let you search one term at the time. If you want to search for a large
 * number of terms, you need a scheduler. This is it.
 */
(function () {

    var bulkWebSearchJs = (function createBulkWebSearchJS() {

        var searchTaskBuckets,
            results,
            currentSearchTask,
            searchers,
            minDelayInMilliseconds,
            maxDelayInMilliseconds
            ;

        reset();

        /**
         * Reset the complete bulksearcher, stopping and removing all searchers, resetting to initial state
         */
        function reset() {
            searchTaskBuckets = [];
            results = [];
            currentSearchTask = null;
            searchers = [];
            minDelayInMilliseconds = 300;
            maxDelayInMilliseconds = 1200;
        }

        /**
         * Add a searcher for the bulk search
         *
         * @param searcher
         */
        function addSearcher(searcher) {
            searchers.push(searcher);
        }

        /**
         * Specify a delay that should be used for waiting between calls.
         * The delay range should be randomly applied to
         * a) reduce stress on vendor servers
         * b) keep the excessive-use policy filters at bay
         *
         * @param newMinDelayInMilliseconds
         * @param newMaxDelayInMilliseconds
         */
        function setDelayRange(newMinDelayInMilliseconds, newMaxDelayInMilliseconds) {
            minDelayInMilliseconds = newMinDelayInMilliseconds;
            maxDelayInMilliseconds = newMaxDelayInMilliseconds;
        }

        /**
         * Search for a list of terms
         *
         * @param array<string> terms
         * @param function callback
         */
        function search(terms, callback) {
            appendSearchTermsToQue(terms, callback);
            next();
        }

        function appendSearchTermsToQue(terms, callback) {
            if (searchers.length === 0) {
                throw new Error('No searcher added. Please use addSearcher() to add a searcher');
            }

            if (!terms || terms.length === 0) {
                callback('No search terms specified', results);
                return;
            }

            var bucket = {
                onSearchDone: callback,
                tasks: []
            };

            for (var termId = terms.length - 1; termId >= 0; termId--) {
                for (var searcherId = 0; searcherId < searchers.length; searcherId++) {
                    var task = {
                        searcher: searchers[searcherId],
                        term: terms[termId]
                    };
                    bucket.tasks.push(task);
                }
            }
            searchTaskBuckets.push(bucket);
        }

        function hasCurrentBucketsTasksLeft() {
            var bucket = getCurrentTaskBucket();
            return typeof bucket !== 'undefined' && bucket.tasks.length > 0;
        }

        function activateNextBucket() {
            searchTaskBuckets.shift();
            results = [];
        }

        function next() {

            if (!hasCurrentBucketsTasksLeft()) {
                activateNextBucket();
            }

            if (searchTaskBuckets.length > 0 && !isSearchInProgress()) {
                currentSearchTask = getCurrentTaskBucket().tasks.pop();
                var delayInMilliseconds = minDelayInMilliseconds +
                    Math.random() * (maxDelayInMilliseconds - minDelayInMilliseconds),
                    startNextSearch = function startNextSearch() {
                        currentSearchTask.searcher.search(currentSearchTask.term, onTaskDone);
                    }
                ;

                setTimeout(startNextSearch, delayInMilliseconds);
            }
        }

        function onTaskDone(error, result) {
            results.push(result);
            currentSearchTask = null;
            var bucket = getCurrentTaskBucket();

            if (bucket.tasks.length === 0) {
                bucket.onSearchDone(error, results);
            }
            setTimeout(next, 0);
        }

        function getCurrentTaskBucket() {
            return searchTaskBuckets[0];
        }

        function isSearchInProgress() {
            return currentSearchTask !== null;
        }

        return {
            search: search,
            addSearcher: addSearcher,
            reset: reset,
            setDelayRange: setDelayRange
        };

    })();

    // make the file module-compatible
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = bulkWebSearchJs;
    }
    // and make it possible to run in the browser, too
    if (typeof window !== 'undefined') {
        window.bulkWebSearchJs = bulkWebSearchJs;
    }
})();