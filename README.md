[![Code Climate](https://codeclimate.com/github/homecoded/websearch.js/badges/gpa.svg)](https://codeclimate.com/github/homecoded/websearch.js)

# websearch.js

> Warning! The deprecated Google APi is dead. This is not working anymore.

A simple interface to websearch. 

It uses a deprecated and **NOT** still functioning Google API. 
The reason for using this deprecated API is the lack of proper alternatives. 
Google's replacement, the "Custom Search API", only offers a defined subset of the web to search, 
not the complete Google index.

The web-searcher can only run one search at a time. This is by design! If you run a number of multiple concurrent 
queries you may trigger Google's abuse detection. If you are using their search, you should make sure you are not
putting unnecessary stress on their servers. 

Make sure that your webservice, if not used privately, shows the Google branding (see https://developers.google.com/web-search/docs/#advanced-branding)
as this is required by their terms of service. See example/example.html to see how you can do that.

# Usage

    webSearchJs.search('mother', function (error, result) {
        console.log('search term', result.term);
        console.log('urls', result.urls);
    });

# Bulk Searching the web

The bulk web searcher strives to solve the the constraints of using Google web search regarding parallel execution.
You can give the bulk searcher a number of searchers to use and a list of terms. As soon as it's done, a callback
will be invoked.

        bulkWebSearchJs.addSearcher(webSearchJs);
        bulkWebSearchJs.addSearcher(bookSearchJs);
        var minDelayInMilliseconds = 100,
            maxDelayInMilliseconds = 400,
            terms = ['Javascript', 'Clean Code', 'Test-Driven Development']
            ;
        bulkWebSearchJs.setDelayRange(minDelayInMilliseconds, maxDelayInMilliseconds);
        bulkWebSearchJs.search(terms, function (error, results) {
            if (error) {
                console.log(error);
                return;
            }
            for (var i = 0; i < results.length; i++) {
                console.log(i, 'search term', result[i].term);
                console.log(i, 'urls', result[i].urls);
            }
            bulkWebSearchJs.reset();
        });
