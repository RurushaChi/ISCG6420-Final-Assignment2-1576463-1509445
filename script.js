window.onload = function () {
    //Using query selector to get area div elements
    const areaA = document.querySelector('.areaA');
    const areaAText = document.querySelector('.areaAText');

    const areaB = document.querySelector('.areaB');
    const areaBText = document.querySelector('.areaBText');

    const areaC = document.querySelector('.areaC');
    const areaCText = document.querySelector('.areaCText');

    const areaD = document.querySelector('.areaD');
    const areaDText = document.querySelector('.areaDText');

    const areaE = document.querySelector('.areaE');
    const areaEText = document.querySelector('.areaEText');

    const areaF = document.querySelector('.areaF');
    const areaFText = document.querySelector('.areaFText');

    const areaG = document.querySelector('.areaG');
    const areaGText = document.querySelector('.areaGText');

    const areaH = document.querySelector('.areaH');
    const areaHText = document.querySelector('.areaHText');

    const areaI = document.querySelector('.areaI');
    const areaIText = document.querySelector('.areaIText');

    const areaJ = document.querySelector('.areaJ');
    const areaJText = document.querySelector('.areaJText');


    // Using query selector to get area button elements
    const areaABtn = document.querySelector('.areaABtn');
    const areaBBtn = document.querySelector('.areaBBtn');
    const areaCBtn = document.querySelector('.areaCBtn');
    const areaDBtn = document.querySelector('.areaDBtn');
    const areaEBtn = document.querySelector('.areaEBtn');
    const areaFBtn = document.querySelector('.areaFBtn');
    const areaGBtn = document.querySelector('.areaGBtn');
    const areaHBtn = document.querySelector('.areaHBtn');
    const areaIBtn = document.querySelector('.areaIBtn');
    const areaJBtn = document.querySelector('.areaJBtn');

    // Using query selector to get area image elements
    const areaAImage = document.querySelector('.areaAImage');
    const areaBImage = document.querySelector('.areaBImage');
    const areaCImage = document.querySelector('.areaCImage');
    const areaDImage = document.querySelector('.areaDImage');
    const areaEImage = document.querySelector('.areaEImage');
    const areaFImage = document.querySelector('.areaFImage');
    const areaGImage = document.querySelector('.areaGImage');
    const areaHImage = document.querySelector('.areaHImage');
    const areaIImage = document.querySelector('.areaIImage');
    const areaJImage = document.querySelector('.areaJImage');


    //Using query selector and ifto display the booking form details
    const bookingTitle = document.getElementById('bookingTitle');

    const arrivalDate =document.getElementById('arrivalDate');
    const depatureDate =document.getElementById('depatureDate');
    const name =document.getElementById('name');
    const emailAdd=document.getElementById('emailAdd');
    const bookingNum = document.getElementById('bookingNum');
    const bookingSummary=document.getElementById('bookingSummary');

    const arrivalDateLbl =document.getElementById('arrivalDateLbl');
    const depatureDateLbl =document.getElementById('depatureDateLbl');
    const nameLbl =document.getElementById('nameLbl');
    const emailAddLbl=document.getElementById('emailAddLbl');
    const bookingNumLbl = document.getElementById('bookingNumLbl');

    const bookingArea = document.querySelector('.bookingArea');
    const bookingSubmit= document.querySelector('.submitBtn');
    const bookingForm= document.querySelector('.bookingForm');
    const makeNewBookingBtn=document.querySelector('.makeNewBookingBtn');
    const returnBtn= document.querySelector('.returnBtn');
   

   

    //store fetched info for other functions
    let currentAreaName="";
    let currentCost=0;
    let currentBookedStatus=0;
    let currentBookedCount=0;
    let currentCapacity=0;
    let currentImage="";
    let totalCost=0;


    //Placing div elements, paragraph, images elements and button elements in lists
    let areaDivList = [areaA, areaB, areaC, areaD, areaE, areaF, areaG, areaH, areaI, areaJ];
    let areaTextList = [areaAText, areaBText, areaCText, areaDText, areaEText, areaFText, areaGText, areaHText, areaIText, areaJText];
    let areaBtnList = [areaABtn, areaBBtn, areaCBtn, areaDBtn, areaEBtn, areaFBtn, areaGBtn, areaHBtn, areaIBtn, areaJBtn];
    let areaImages = [areaAImage, areaBImage, areaCImage,  areaDImage,areaEImage,  areaFImage, areaGImage, areaHImage, areaIImage, areaJImage];
    let alphabetList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];


    fetch('areas.xml')
        .then(function(response) {
            return response.text();
        })
        .then(function(xmlString) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");

            areaDivList.forEach(function(div, index) {
                div.addEventListener('mouseenter', function() {
                    //To remove other area divs
                    areaDivList.forEach(function(div, i) {
                    if (i !== index) {
                        div.style.display = 'none';  // hide divs not matching the index
                    } 
                    });

                    //To highlight the selected div
                    div.style.opacity="100%";
                    div.style.backgroundColor="white";

                    //To Decrease font size and align the text
                    div.style.fontSize="15px";
                    div.style.textAlign="left";

                    //To add a border
                    div.style.border='3px solid blue';
                
                    //Set explansion top and left based on position on map
                    if (index === 3 || index === 4 || index === 6 || index === 7 || index === 8 || index === 9) {
                        div.style.width = "300px";
                        div.style.height = "300px";
                        div.style.transform = "translate(-250px, -250px)"; // move it left so it expands left
                        
                    }
                    if(index===2){
                        div.style.width = "300px";
                        div.style.height = "300px";
                        div.style.transform="translateY(-100px)";
                    }               
                    else{
                        div.style.width = "300px";
                        div.style.height = "300px";
                    }
                    
                    const area = xmlDoc.getElementsByTagName("area")[index];
                    currentAreaName = area.getElementsByTagName("areaName")[0].textContent;
                    currentCost = area.getElementsByTagName("cost")[0].textContent;
                    currentBookedCount = area.getElementsByTagName("bookedCount")[0].textContent;
                    currentCapacity = area.getElementsByTagName("capacity")[0].textContent;
                    currentImage=area.getElementsByTagName("areaImage")[0].textContent;

                    //setting booked status
                    if(currentBookedCount==currentCapacity){
                        currentBookedStatus="Full";
                    }
                    else{
                        currentBookedStatus="Available"
                    }


                    areaTextList[index].innerHTML = currentAreaName +"<br>Cost: $" + currentCost + "pp<br>" +"Status: " + currentBookedStatus + "<br>" +"Spaces Availabe: " +(currentCapacity-currentBookedCount) + "<br>"+"Capacity: " + currentCapacity;
                    //To display expansion images
                    areaImages[index].style.backgroundImage=`url('${currentImage}')`;
                    areaImages[index].style.display='block';

                    //Check if the capacity is full
                    if(currentBookedCount==currentCapacity){
                        areaBtnList[index].disabled = true; //disable if full
                    }
                    
                    areaBtnList[index].style.display='block'; //dissplay button
                    
                     //if book button is clicked
                    areaBtnList[index].addEventListener('click', function () {
                        bookingForm.style.display='block';
                        bookingArea.style.display = 'block';
                        bookingArea.textContent =currentAreaName; // or some info from currentArea
                        bookingNum.max=currentCapacity-currentBookedCount; //set the max
                    });

                });

                div.addEventListener('mouseleave', function() {
                    areaDivList.forEach(function(div, i) {
                    if (i !== index) {
                        div.style.display = 'block';  // hide divs not matching the index
                    } 
                    //so image does not display after mouse leave
                    areaImages[index].style.display='none';
                    });

                    //Return to default settings
                    div.style.fontSize="40px";
                    div.style.textAlign="center";
                    div.style.opacity="70%"
                    div.style.backgroundColor="greenyellow";
                    div.style.border='0px solid blue';
                    
                    areaTextList[index].textContent = alphabetList[index];
                    if (index === 3 || index === 4 || index === 6 || index === 7 || index === 8 || index === 9) {
                        div.style.width = "50px";
                        div.style.height = "50px";
                        div.style.transform = "translate(0px, 0px)"; // move it left so it expands left
                        
                    }
                    if(index===2){
                        div.style.width = "50px";
                        div.style.height = "50px";
                        div.style.transform="translateY(0px)";
                    }   
                    else{
                        div.style.width = "50px";
                        div.style.height = "50px";
                    }

                    
                    
                    areaBtnList[index].style.display='none';
                });
            });
        });

        makeNewBookingBtn.addEventListener('click', function(){
        //Reset Values
        arrivalDate.value = "";
        depatureDate.value = "";
        bookingNum.value = "";
        name.value = "";
        emailAdd.value = "";

        //set  to display for later
        arrivalDate.style.display = "block";
        depatureDate.style.display = "block";
        bookingNum.style.display = "block";
        name.style.display = "block";
        emailAdd.style.display = "block";
        

        arrivalDateLbl.style.display = "block";
        depatureDateLbl.style.display = "block";
        bookingNumLbl.style.display = "block";
        nameLbl.style.display = "block";
        emailAddLbl.style.display = "block";
        bookingSubmit.style.display="block";

        bookingArea.textContent ="";
        bookingSummary.style.display = "none";
        makeNewBookingBtn.style.display='none';
        returnBtn.style.display='none';

        //Hide entire Form
        bookingForm.style.display='none';
        alert("Booking Confirmed");

    });

    bookingSubmit.addEventListener('click', function () {
        if(arrivalDate.value != "" && depatureDate.value!=""&& bookingNum.value>0&& name.value!=""&&emailAdd.value!=""&&bookingNum.value<=(currentCapacity-currentBookedCount)){
            bookingSummary.style.display = "block";


            // Hide previous Input elements
            arrivalDate.style.display = "none";
            depatureDate.style.display = "none";
            bookingNum.style.display = "none";
            name.style.display = "none";
            emailAdd.style.display = "none";
            

            arrivalDateLbl.style.display = "none";
            depatureDateLbl.style.display = "none";
            bookingNumLbl.style.display = "none";
            nameLbl.style.display = "none";
            emailAddLbl.style.display = "none";
            bookingSubmit.style.display="none";

            //Calculating the difference between 2 dates using the Date object and time in milliseconds.
            const dateA = new Date(arrivalDate.value); 
            const dateB = new Date(depatureDate.value);
            const diffTime = Math.abs(dateA - dateB); 
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            //for same day arrival and depature
            if(diffDays<1){
                diffDays=1;
            }
           
            //Final Cost including area cost
            totalCost = (parseFloat(currentCost) * parseFloat(bookingNum.value))*diffDays;      

            // Show booking summary values
            bookingSummary.innerHTML = `
            Name: ${name.value} <br>
            Email: ${emailAdd.value} <br>
            Arrival Date: ${arrivalDate.value} <br>
            Departure Date: ${depatureDate.value} <br>
            Number of People: ${bookingNum.value}<br>
            Total Cost: $${totalCost}.00<br>
            `;

            bookingSubmit.style.display='none';
            bookingSummary.style.display = "block";
            makeNewBookingBtn.style.display="block";
            returnBtn.style.display='block';
        }
        else{
            //checking alert reason
            if(bookingNum.value>(currentCapacity-currentBookedCount)){
                alert("The number of people you would like to book for exceeds the spaces available.");
            }
            else{
            alert("One or more feild have not been filled.Please check the form carefully and fill in the missing feilds before submitting.");
            }
        }
        
    });   
    
    returnBtn.addEventListener('click', function () {
        totalCost=0;
        makeNewBookingBtn.style.display='none';
        bookingSubmit.style.display='block';
        returnBtn.style.display='none';
        bookingSummary.style.display='none';

        // show previous Input elements
        arrivalDate.style.display = "block";
        depatureDate.style.display = "block";
        bookingNum.style.display = "block";
        name.style.display = "block";
        emailAdd.style.display = "block";
            

        arrivalDateLbl.style.display = "block";
        depatureDateLbl.style.display = "block";
        bookingNumLbl.style.display = "block";
        nameLbl.style.display = "block";
        emailAddLbl.style.display = "block";
        bookingSubmit.style.display="block";

    });
};
