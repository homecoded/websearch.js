/* global describe, expect, it, webSearchJs, bookSearchJs */

window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('Searcher', function () {

    function runTestsForSearcher(searcherName, searcher) {

        it(searcherName + ' should be available', function (done) {
            expect(searcher).toBeDefined();
            done();
        });

        it(searcherName + '  should return a result when generic term is searched', function (done) {
            var testTerm = 'test';

            function onSearchResultReceived(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeDefined();
                expect(result.urls.length).toBeGreaterThan(0);
                expect(result.term).toBe(testTerm);
                done();
            }
            searcher.search(testTerm, onSearchResultReceived);
        });

        it(searcherName + '  requires a callback parameter', function (done) {

            var isErrorNoCallbackThrown = false;
            var isErrorFalseCallbackThrown = false;
            try {
                searcher.search('foo');
            } catch (error) {
                isErrorNoCallbackThrown = true;
            }
            try {
                searcher.search('foo', {});
            } catch (error) {
                isErrorFalseCallbackThrown = true;
            }
            expect(isErrorNoCallbackThrown).toBeTruthy();
            expect(isErrorFalseCallbackThrown).toBeTruthy();
            done();
        });


        it(searcherName + ' must not be called called simultaneously', function (done) {
            var testTerm1 = 'tester',
                testTerm2 = 'motherly',
                runCount = 0
                ;

            function onSearchResultReceived(error, result) {
                if (runCount === 0) {
                    expect(error !== null).toBeTruthy();
                    expect(result).toBeUndefined();
                    expect(error.length).toBeGreaterThan(0);
                } else {
                    done();
                }
                runCount++;
            }

            searcher.search(testTerm1, onSearchResultReceived);
            searcher.search(testTerm2, onSearchResultReceived);
        });


        it(searcherName + ' must be callable after one another', function (done) {

            var onSecondRunDone = function(error) {
                expect(error).toBeFalsy();
                done();
            };

            var onFirstRunDone = function onFirstRunDone() {
                searcher.search('brother', onSecondRunDone);
            };

            searcher.search('sister', onFirstRunDone);
        });

        it(searcherName + ' must return non-URL-encoded URLs', function (done) {

            var onFirstRunDone = function onFirstRunDone(error, result) {
                expect(error).toBeFalsy();
                for (var i = 0; i < result.urls.length; i++) {
                    var urlReturned = result.urls[i];
                    var urlDecoded = decodeURIComponent(result.urls[i]);
                    expect(urlReturned).toBe(urlDecoded);
                }
                done();
            };
            searcher.search('sister', onFirstRunDone);
        });

    }

    it('check that webSearchJs and bookSearchJs are different objects', function (done) {
        expect(webSearchJs === bookSearchJs).toBeFalsy();
        done();
    });

    runTestsForSearcher('webSearchJs', webSearchJs);
    runTestsForSearcher('bookSearchJs', bookSearchJs);

});

