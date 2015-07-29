window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

describe('Websearcher test suite', function () {

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
            var testTerm1 = 'test',
                testTerm2 = 'mother',
                runCount = 0
                ;

            function onSearchResultReceived(error, result) {
                runCount++;
                if (runCount > 0) {
                    expect(error).toBeDefined();
                    expect(result).toBeUndefined();
                    expect(error.length).toBeGreaterThan(0);
                    done();
                }
            }

            searcher.search(testTerm1, onSearchResultReceived);
            searcher.search(testTerm2, onSearchResultReceived);
        });
    }

    it('check that webSearchJs and bookSearchJs are different objects', function (done) {
        expect(webSearchJs === bookSearchJs).toBeFalsy();
        done();
    });

    runTestsForSearcher('webSearchJs', webSearchJs);
    runTestsForSearcher('bookSearchJs', bookSearchJs);

});

