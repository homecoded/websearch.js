/**
 * websearch.js
 * A simple interface to websearch. It uses a deprecated but still functioning Google API.
 * The reason, why we use this deprecated API is that there is no proper alternative for this API (for complete websearch).
 * The Custom Search API only offers a defined subset of the web to search, not the complete Google index.
 *
 */

(function () {
    function createSearcher(webSearcherClassName) {

        var vendorApiScriptUrl = 'http://www.google.com/jsapi',
            term = '',
            onSearchDone = null,
            searchControl = null,
            ERRORS = {
                ONGOING_SEARCH_INTERRUPTED: 'You must not start a search while another is still ongoing',
                NO_CALLBACK: 'No callback specified when calling search'
            }
            ;

        /**
         * Search for a term in the internet
         *
         * @param term
         * @param callback
         */
        function search(searchTerm, callback) {
            if (typeof callback !== 'function') {
                throw new Error(ERRORS.NO_CALLBACK);
                return;
            }

            if (wasSearchRequested()) {
                callback(ERRORS.ONGOING_SEARCH_INTERRUPTED);
                return;
            }
            term = searchTerm;
            onSearchDone = callback;

            if (isVendorApiLoaded()) {
                doExternalWebSearch();
            }
        }

        function wasSearchRequested() {
            return term !== '' && onSearchDone !== null;
        }

        function isVendorApiLoaded() {
            return typeof window.google !== 'undefined' &&
                typeof window.google.load !== 'undefined' &&
                searchControl !== null
        }

        function loadVendorScript() {
            var vendorScript = document.createElement('script');
            vendorScript.type = 'text/javascript';
            vendorScript.onload = onGoogleApiLoaded;
            vendorScript.src = vendorApiScriptUrl;
            document.body.appendChild(vendorScript);
        }

        function onGoogleApiLoaded() {
            google.load(
                "search",
                "1",
                {
                    callback: function () {
                        var webSearcherClass = google.search[webSearcherClassName];
                        searchControl = new webSearcherClass();
                        searchControl.setNoHtmlGeneration();
                        searchControl.setResultSetSize(google.search.Search.LARGE_RESULTSET);
                        onVendorScriptLoaded();
                    }
                }
            );
        }

        function onVendorScriptLoaded() {
            if (wasSearchRequested()) {
                doExternalWebSearch();
            }
        }

        function doExternalWebSearch() {
            searchControl.setSearchCompleteCallback(
                this,
                function () {
                    var searchResult = {};
                    searchResult.term = term;
                    searchResult.urls = [];

                    for (var result in searchControl.results) {
                        searchResult.urls.push(searchControl.results[result].url);
                    }
                    onSearchDone(null, searchResult);
                },
                null
            );
            searchControl.execute(term);
        }

        // init sequence
        loadVendorScript();

        return {
            search: search
        }
    }

    var webSearchJs = createSearcher('WebSearch');
    var bookSearchJs = createSearcher('BookSearch');

    // make the file module ready
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = {
            webSearchJs: webSearchJs,
            bookSearchJs: bookSearchJs
        };
    }

    // and make it possible to run in the browser, too
    if (typeof window !== 'undefined') {
        window.webSearchJs = webSearchJs;
        window.bookSearchJs = bookSearchJs;
    }
})();

