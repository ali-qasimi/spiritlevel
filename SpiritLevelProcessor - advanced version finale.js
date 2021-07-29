/****************************************************************************************
Avaiable functions for usage in the uiController object
================================================================
uiController.bubbleTranslate(x,y, id)
    This function will translate the bubble from the middle of the screen.
    The center of the screen is considered (0,0).

    Inputs:
        x,y
        Translates the bubble x px right and y px up. Negative values are accepted
        and translate the bubble in the opposite direction.

        id
        ID of bubble that needs to be moved

uiController.bodyDimensions()
    Returns the width and height of the body (without the toolbar)

    Return:
        Returns an object with the following fields
        {
            width:      [Returns the width of the body],
            height:     [Returns the width of the body]
        }

ID of HTML elements that are of interest
==============================================================
dark-bubble
    ID of the dark green bubble

pale-bubble
    ID of the pale green bubble

message-area
    ID of text area at the bottom of the screen, just on top on the "Feeze" button

freeze-button
    ID of the "Freeze" button
****************************************************************************************/

function SpiritLevelProcessor()
{
    var self = this;

    var uiController = null;

    self.initialise = function(controller)
    {
        uiController = controller;

        window.addEventListener("devicemotion", handleMotion); //when device motion event occurs, run handle motion function. devicemotion event finds out amount of acceleration the device receives, also its rate of rotation.
    }
    
    var bufferX = [0]
    var bufferY = [0]
    var bufferZ = [0]
    
    var averageX, averageY, averageZ
    var medianX, medianY, medianZ
    var method

    method = prompt("please type either 'mean' or 'median': ")
    
    while (method !== "mean" && method !== "median"){
        method = prompt("please type EITHER 'mean' or 'median' (all lowercase): ")
    }
    
    function handleMotion(event)
    {
        // This function handles the new incoming values from the accelerometer
        var aZ, aX, aY
        var dimensions
        
            
        aX = event.accelerationIncludingGravity.x; //leftright flip, 
        aY = event.accelerationIncludingGravity.y; //backforth flip
		aZ = event.accelerationIncludingGravity.z; //updown move
        
        dimensions = uiController.bodyDimensions();
        
        if (method === "mean"){
        averageX = movingAverage(bufferX, aX)*25   // the aX aY and aZ give values b/n 0 and 1, so I times it by a constant so that the 
        averageY = -movingAverage(bufferY, aY)*25  // bubble can more more. 
        averageZ = movingAverage(bufferZ, aZ)*25
        
        
        //keeping it within the screen.
        while (Math.abs(averageX) > dimensions["width"]/2){
            if (averageX > 0){
            averageX = dimensions["width"]/2;
            }
            else if (averageX < 0){
                averageX = -dimensions["width"]/2;
            }
        }
        
        while (Math.abs(averageY) > dimensions["height"]/2){
            if (averageY > 0){
            averageY = dimensions["height"]/2;
            }
            else if (averageY < 0){
                averageY = -dimensions["height"]/2;
            }
        }
        
        
        //moving the bubble
        uiController.bubbleTranslate(averageX, averageY, "dark-bubble")
        //showing the angle from z axis
        displayAngle(averageX, averageY, averageZ)
       
        }
        
        else if (method === "median"){
        
        medianX = movingMedian(bufferX, aX)*25
        medianY = -movingMedian(bufferY, aY)*25
        medianZ = movingMedian(bufferZ, aZ)*25  
        
        while (Math.abs(medianX) > dimensions["width"]/2){
            if (medianX > 0){
            medianX = dimensions["width"]/2;
            }
            else if (medianX < 0){
                medianX = -dimensions["width"]/2;
            }
        }
        
        while (Math.abs(medianY) > dimensions["height"]/2){
            if (medianY > 0){
            medianY = dimensions["height"]/2;
            }
            else if (medianY < 0){
                medianY = -dimensions["height"]/2;
            }
        }
        
        uiController.bubbleTranslate(medianX, medianY, "dark-bubble")
        
        displayAngle(medianX, medianY, medianZ)
        }
        
    }
    
    
    
    function movingAverage(buffer, newValue) //buffer is an array in which the incomming data is stored.
    {
        // This function handles the Moving Average Filter

        // Input:
        //      buffer
        //      The buffer in which the function will apply the moving to.
        
        //      newValue:
        //      This should be the newest value that will be pushed into the buffer

        // Output: filteredValue
        //      This function should return the result of the moving average filter
       
        var sum = 0;
        
        buffer.push(newValue)
        
        while (buffer.length >= 10){
            buffer.shift()
        }
        
        for (var iteration = 0; iteration <=buffer.length-1; iteration++) {
        sum += buffer[iteration];
            }
        return sum/buffer.length;
    }


    function displayAngle(x,y,z)
    {
        // This function will handle the calculation of the angle from the z-axis and
        // display it on the screen inside a "div" tag with the id of "message-area"

        // Input: x,y,z
        //      These values should be the filtered values after the Moving Average for
        //      each of the axes respectively
        var angleZRad, angleZDeg
        
        var pythagoras = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
        angleZRad = Math.acos(z/pythagoras);
        angleZDeg = angleZRad*180/(Math.PI);
        
        document.getElementById("message-area").innerHTML = "from z-axis: " + angleZDeg.toFixed(4) + " degrees";
    }
   
    

    self.freezeClick = function()
    {
        // ADVANCED FUNCTIONALITY
        // ================================================================
        // This function will trigger when the "Freeze" button is pressed
        // The ID of the button is "freeze-button"
        if (method === "mean"){
            uiController.bubbleTranslate(averageX, averageY, "pale-bubble")
        }
        
        else if(method === "median") {
            uiController.bubbleTranslate(medianX, medianY, "pale-bubble")
        }
    }

    function movingMedian(buffer, newValue)
    {
      // ADVANCED FUNCTIONALITY
      // =================================================================
      // This function handles the Moving Median Filter
      // Input:
      //      buffer
      //      The buffer in which the function will apply the moving to.

      //      newValue
      //      This should be the newest value that will be pushed into the buffer

      // Output: filteredValue
      //      This function should return the result of the moving average filter
        
        var sorted, filteredValue
        
         while (buffer.length >= 2){
            buffer.shift()
        }
        
            buffer.push(newValue)
        
        for (var i = buffer.length-1; i >= 1; i--){

                while (Math.abs(buffer[i]-buffer[i-1])>1){
                    
                    if (buffer[i]-buffer[i-1]>0){
                        buffer.splice(i, 0, buffer[i-1]+1)
				        i++
                    }
	 
                else if (buffer[i]-buffer[i-1]<0){
                    buffer.splice(i, 0, buffer[i-1]-1)
                    i++
                    }
                }
        }
        
        sorted = buffer.slice(0,buffer.length);
            
        sorted = sorted.sort()
        if (buffer.length % 2 !== 0){
            buffer.shift()
        }
        filteredValue = (sorted[buffer.length/2-1]+sorted[buffer.length/2])/2;
        
        return filteredValue;
    }
}


