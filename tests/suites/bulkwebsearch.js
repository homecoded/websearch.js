describe('Bulk-Websearcher test suite', function () {

    var mockSearcherIntervalIds = [];

    afterEach(function resetSearcher() {
        bulkWebSearchJs.reset();
        for (var i = 0; i < mockSearcherIntervalIds; i++) {
            clearInterval(mockSearcherIntervalIds[i]);
        }
    });

    function createMockSearcher() {
        var urlCount = 0;
        var searchCount = 0;
        var searchTermsOrdered = [];
        var callTimes = [];
        var delay = 40;
        var resultCount = 3;

        function search(term, callback) {
            searchCount++;
            searchTermsOrdered.push(term);
            callTimes.push(Date.now());
            mockSearcherIntervalIds.push(setTimeout(function () {
                var urls = [];
                for (var i = 0; i < resultCount; i++) {
                    urls.push('http://domain' + (urlCount++) + '.de');
                }

                callback(null, {
                    term: term,
                    urls: urls
                });
            }, delay));
        }

        function getSearchCount() {
            return searchCount;
        }

        function getSearchTermOrdered() {
            return searchTermsOrdered;
        }

        function getCallTimes() {
            return callTimes;
        }

        function setDelay(newDelay) {
            delay = newDelay;
        }

        function getResultLength() {
            return resultCount;
        }

        return {
            search: search,
            getSearchCount: getSearchCount,
            getSearchTermOrdered: getSearchTermOrdered,
            setDelay: setDelay,
            getCallTimes: getCallTimes,
            getResultLength: getResultLength
        }
    }

    it('bulkwebsearcher should be defined', function (done) {
        expect(bulkWebSearchJs).toBeDefined();
        done();
    });

    it('bulkwebsearcher should throw an error if no searcher is added', function (done) {
        var isError = false;
        try {
            bulkWebSearchJs.search(['none'], function () {
            });
        } catch (e) {
            isError = true;
        }
        expect(isError).toBeTruthy();
        done();
    });

    it('bulkwebsearcher should return one result in an array', function (done) {
        var term = 'father';
        var mockSearcher = createMockSearcher();
        bulkWebSearchJs.addSearcher(mockSearcher);
        bulkWebSearchJs.search([term], onSearchResultsReceived);
        function onSearchResultsReceived(error, result) {
            var arrayType = Object.prototype.toString.call([]);
            expect(Object.prototype.toString.call(result)).toBe(arrayType);
            done();
        }
    });

    it('bulkwebsearcher should run several searchers one after another', function (done) {
        var mockSearcher = createMockSearcher(),
            terms = ['differentSearcherTerm1', 'differentSearcherTerm2', 'differentSearcherTerm3']
            ;
        bulkWebSearchJs.addSearcher(mockSearcher);
        bulkWebSearchJs.addSearcher(mockSearcher);
        bulkWebSearchJs.search(terms, onBulkSearchCompleted);

        function onBulkSearchCompleted(error, result) {
            expect(mockSearcher.getSearchCount()).toBe(terms.length * 2);
            var searchTermsInOrderOfCall = mockSearcher.getSearchTermOrdered();
            for (var i = 0; i < searchTermsInOrderOfCall.length; i++) {
                var index = Math.floor(i / 2);
                var expectedTerm = terms[index];
                var actualTerm = searchTermsInOrderOfCall[i];
                expect(expectedTerm).toBe(actualTerm);
            }
            done();
        }
    });

    it('bulkwebsearcher should add some random time offset', function (done) {
        var mockSearcher = createMockSearcher(),
            terms = [],
            delayInMilliseconds = 5,
            minDelayInMilliseconds = 10,
            maxDelayInMilliseconds = 50,
            jitterInMilliseconds = 5, // there can be small differences in the timing, so we need a little jitter
            i,
            testGroupLength = 30
            ;
        mockSearcher.setDelay(delayInMilliseconds);

        for (i = 0; i < testGroupLength; i++) {
            terms.push('term' + i);
        }

        bulkWebSearchJs.addSearcher(mockSearcher);
        bulkWebSearchJs.setDelayRange(minDelayInMilliseconds, maxDelayInMilliseconds);
        bulkWebSearchJs.search(terms, onBulkSearchRandomDelayCompleted);

        var minTimeDifference = delayInMilliseconds + minDelayInMilliseconds - jitterInMilliseconds;
        var maxTimeDifference = delayInMilliseconds + maxDelayInMilliseconds + jitterInMilliseconds;

        function onBulkSearchRandomDelayCompleted(error, result) {
            var callTimes = mockSearcher.getCallTimes();
            var correctMaxTimes = 0;
            for (var i = 1; i < callTimes.length; i++) {
                var timeDifference = callTimes[i] - callTimes[i - 1];
                // min delay is enforced
                expect(timeDifference >= minTimeDifference).toBeTruthy();
                // max delay is sometimes bigger when VW hiccups
                if (timeDifference <= maxTimeDifference) {
                    correctMaxTimes++;
                }
            }
            var maxDelayCorrectRelation = correctMaxTimes / testGroupLength;
            // it's enough when max delay is correct most of the times
            expect(maxDelayCorrectRelation >= 0.5).toBeTruthy();

            done();
        }
    });

    it('bulksearcher should be able to process different sets of terms with different callbacks', function (done) {
        var mockSearcher = createMockSearcher(),
            terms = ['termA', 'termB', 'termC'],
            terms2 = ['termA1', 'termB2', 'termC3'],
            hasFirstSearchRun = false,
            resultCount = 0
            ;

        function onFirstSearchDone(error, results) {
            hasFirstSearchRun = true;
            resultCount += results.length;
            for (var i = 0; i < results.length; i++) {
                expect(results[i].term).toBe(terms[i]);
            }
            expect(resultCount).toBe(mockSearcher.getSearchCount());
        }

        function onSecondSearchDone(error, results) {
            expect(hasFirstSearchRun).toBeTruthy();
            for (var i = 0; i < results.length; i++) {
                expect(results[i].term).toBe(terms2[i]);
            }
            resultCount += results.length;
            expect(resultCount).toBe(mockSearcher.getSearchCount());
            done();
        }

        bulkWebSearchJs.addSearcher(mockSearcher);
        bulkWebSearchJs.search(terms, onFirstSearchDone);
        bulkWebSearchJs.search(terms2, onSecondSearchDone);
    });

    it('bulkwebsearcher exists directly if no terms are supplied', function (done) {
        var mockSearcher = createMockSearcher(),
            callCount = 0
            ;
        bulkWebSearchJs.addSearcher(mockSearcher);
        bulkWebSearchJs.search(null, onErrorHappened);
        bulkWebSearchJs.search([], onErrorHappened);

        function onErrorHappened(error, result) {
            expect(result.length).toBe(0);
            expect(error).toBeTruthy();
            callCount++;
            if (callCount == 2) {
                done();
            }
        }
    });

});