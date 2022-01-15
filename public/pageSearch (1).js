document.getElementById('searchDives').addEventListener('click', (event) =>{
    let payload= {};
    // setup payload to handle both different potential data sets of lbs or kgs        
    payload.locationID = `${document.getElementById('searchDiveID').value}`;
    async function searchDives(url , data = {}) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
                });
                return response.json()
        } catch(error) {
            console.log("this is a problem " + error)
        }
    };
    searchDives("/dives/search", payload)
        .then((returnData) => {
            // remove all of the exisiting dives that are displayed
            let node = document.getElementById("displayDives");
            node.querySelectorAll('*').forEach(n => n.remove());
            // display new dives
            displayDives(returnData)
            event.preventDefault();
        })
});

function displayDives(dives) {

    // create main table and style with 2px solid border and add to body
    const topLevel = document.getElementById('displayDives')
    for (dive of dives) {
        console.log(dive)
        let diveDiv = document.createElement("div");
        diveDiv.classList = "card cardIndex col-12 col-sm-6 col-md-4 dive-card"
        topLevel.appendChild(diveDiv)

        let diveBody = document.createElement("div");
        diveBody.className = "card-body";
        diveDiv.appendChild(diveBody);

        let diveTitle = document.createElement("H4");
        diveTitle.innerText = `Dive was at ${dive.name}`
        diveBody.appendChild(diveTitle)
        
        let diveUl = document.createElement("ul");
        diveBody.appendChild(diveUl)

        let diveLiLoc = document.createElement("li");
        diveLiLoc.innerText = `The Location was: ${dive.locCity}, ${dive.locState} in ${dive.locCountry}`
        diveUl.appendChild(diveLiLoc);
        let diveLiDate = document.createElement("li");
        diveLiDate.innerText = new Date(dive.date.slice(0,10)).toDateString().slice(0,16);
        diveUl.appendChild(diveLiDate);
        
        buttonForm(diveBody, "/dives/details", "See Dive Details")
        buttonForm(diveBody, "/dives/edit", "Update Dive")
        buttonForm(diveBody, "/dives/deleteDive?_method=DELETE", "Delete Dive")
    }
    function buttonForm (diveBody, action, inText) {
        let diveForm = document.createElement("Form");
        diveForm.action = action;
        diveForm.method = "POST"
        diveBody.appendChild(diveForm);

        let diveInput = document.createElement("input");
        diveInput.type = "hidden";
        diveInput.name = "diveID";
        diveInput.value = dive.diveID;
        diveForm.appendChild(diveInput);
        
        let diveButton = document.createElement("button");
        diveButton.classList = "btn-1"
        diveButton.innerText = inText;
        diveForm.appendChild(diveButton)
    }
}
