
var expect = require('expect.js');
var fs = require('fs');
var diffString = fs.readFileSync(__dirname + "/data/diff.txt").toString();
var diffParser = require(__dirname + "/../lib/diff_parser.js")();


describe('Diff parser', function(){

    it('should find the files in the diff',function(){
        var files = diffParser.findTests(diffString);
        expect(files.length).to.equal(2);
        expect(files[0].name).to.equal("app/src/main/java/com/cardinalhealth/alfred/patient/model/PodEventLogger.java app/src/main/java/com/cardinalhealth/alfred/patient/model/PodEventLogger.java");
        expect(files[1].name).to.equal("app/src/test/java/com/cardinalhealth/alfred/patient/model/PodEventLoggerTest.java app/src/test/java/com/cardinalhealth/alfred/patient/model/PodEventLoggerTest.java");
    });

    it('should find the files in the diff',function(){
        var files = diffParser.findTests(diffString);
        expect(files.length).to.equal(2);
        expect(files[0].tests.length).to.equal(0);
        expect(files[1].tests.length).to.equal(2);
        expect(files[1].tests[0].wasModified).to.equal(true);
        expect(files[1].tests[1].wasModified).to.equal(false);
    });


    it('should know the diff command for an issue', function(){
        var cardObjects = JSON.parse(fs.readFileSync(__dirname + "/data/glimr_results_cards.json").toString());
        var cmdArgs = diffParser.getDiffCommandArgs(cardObjects[0])
        var expectedCmdArgs = ["diff","--no-prefix",
                                          "-U1000","4fc7d8e3daba0880808ebd2c71f5535127d7b23f",
                                          "ea0f267cc686c367389af6db4b1670fd9fff7cc3"];
        for(var i=0; i<expectedCmdArgs.length; i++) {
            expect(cmdArgs[i]).to.equal(expectedCmdArgs[i]);
        }

    });

});
