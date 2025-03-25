Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data : file.dataURL
        },function(data, status) {
            console.log(data);
            /* 
            Below is a sample response if you have two faces in an image lets say virat and roger together.
            Most of the time if there is one person in the image you will get only one element in below array
            data = [
                {
                    class:"Mahinda Rajapaksa",
                    class_probability:  [0.17, 0.86, 96.66, 0.69, 1.62],
                    class_dictionary: {
                      Anura Kumara Dissanayaka:0,
                      Gotabaya Rajapaksa:1,
                      Mahinda Rajapaksa:2,
                      Maithripala Sirisena:3,
                      Ranil Wickremesinghe:4,
                    }
                },
                {
                    class:"Anura Kumara Dissanayaka",
                    class_probability:  [97.36, 0.53, 0.62, 0.46, 1.03],
                    class_dictionary: {
                      Anura Kumara Dissanayaka:0,
                      Gotabaya Rajapaksa:1,
                      Mahinda Rajapaksa:2,
                      Maithripala Sirisena:3,
                      Ranil Wickremesinghe:4,
                    }
                }
            ]
            */
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    bestScore = maxScoreForThisClass;                        
                    match = data[i];
                }
                if(match) {
                    $("#error").hide();
                    $("#resultHolder").show();
                    $("#divClassTable").show();
                    $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                    let classDictionary = match.class_dictionary;
                    for(let personName in classDictionary) {
                        let index = classDictionary[personName];
                        let proabilityScore = match.class_probability[index];
                        let elementName = `td[id='score ${personName}']`;
                        $(elementName).html(proabilityScore);
                    }
                }
            }                 
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").show();
    $("#divClassTable").show();

    init();
});