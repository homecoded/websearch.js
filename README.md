[![Code Climate](https://codeclimate.com/github/homecoded/websearch.js/badges/gpa.svg)](https://codeclimate.com/github/homecoded/websearch.js)

# websearch.js

A simple interface to websearch. 

It uses a deprecated but still functioning Google API. 
The reason for using this deprecated API is the lack of proper alternatives. 
Google's replacement, the "Custom Search API", only offers a defined subset of the web to search, 
not the complete Google index.

The web-searcher can only run one search at a time. This is by design! If you run a number of multiple concurrent 
queries you may trigger Google's abuse detection. If you are using their search, you should make sure you are not
putting unnecessary stress on their servers. 

Make sure that your webservice, if not used privately, shows the Google branding (see https://developers.google.com/web-search/docs/#advanced-branding)
as this is required by their terms of service.

# Usage

    websearch.search('mother', function (error, result) {
        console.log('search term', result.term);
        console.log('urls', result.urls);
    });

# TODO

- bulk searcher, that step by step goes through a list of terms and returns the results in one callback, should support web and book search