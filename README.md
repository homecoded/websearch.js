# websearch.js
A simple interface to websearch. It uses a deprecated but still functioning Google API. T
he reason, why we use this deprecated API is that there is no proper alternative for this API (for complete websearch). 
The Custom Search API only offers a defined subset of the web to search, not the complete Google index.

# Usage

    websearch.search('mother', function (error, result) {
        console.log('search term', result.term);
        console.log('urls', result.urls);
    });

# TODO

- bulk searcher, that step by step goes through a list of terms and returns the results in one callback, should support web and book search