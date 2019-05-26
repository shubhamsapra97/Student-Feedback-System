$( document ).ready(function() {
    
    if(window.location.pathname == '/login' || window.location.pathname == '/feedback'){
        var radioButtons = document.getElementsByClassName('radioSelect');

        for (var j = 0; j < radioButtons.length; j++) {
            (function(radio) {
                radioButtons[j].style.backgroundColor = "white";
                radio.addEventListener('click', function(e) {
                    e.target.parentNode.parentNode.style.backgroundColor = "skyblue";
                    setTimeout(function(){
                        e.target.parentNode.parentNode.style.backgroundColor = "white";
                    },2000);
                });
            })(radioButtons[j]);
        }
        
        // Feedback Form Validation. 
        var submitBtn = document.getElementsByClassName('selectOption')[0];
        submitBtn.addEventListener('submit',function(e){
            e.preventDefault(); //stop submit

            var radioSelect = document.getElementsByClassName("radioSelect");

            // Check if one of the radio button is checked or not.
            for(var i=0;i<radioSelect.length;i++){
                if(radioSelect[i].checked){
                    document.getElementById('feedbacktype').value = radioSelect[i].nextElementSibling.textContent;
                    $('#exampleModal').modal('show');
                    return true;            
                }
            }
            return false;
        });
        
    }
    
    if(window.location.pathname == '/adminFeedback'){
        
        $(document).ready(function() {
            
              var data = document.getElementsByClassName('county');
              var hostelCount = data[0] ? parseInt(data[0].textContent) : 0 ;
              var hostelMessCount = data[1] ? parseInt(data[1].textContent) : 0;
              var teacherCount = data[2] ? parseInt(data[2].textContent) : 0;
              var SQ1Count = data[3] ? parseInt(data[3].textContent) : 0;

              // Load the Visualization API and the corechart package.
              google.charts.load('current', {'packages':['corechart']});

              // Set a callback to run when the Google Visualization API is loaded.
              google.charts.setOnLoadCallback(drawChart);

              // Callback that creates and populates a data table,
              // instantiates the pie chart, passes in the data and
              // draws it.
              function drawChart() {

                // Create the data table.
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'FeedbackType');
                data.addColumn('number', 'Count');
                data.addRows([
                  ['Hostel', hostelCount],
                  ['Hostel Mess', hostelMessCount],
                  ['Square One', SQ1Count],
                  ['Teacher', teacherCount]
                ]);

                // Set chart options
                var options = {'title':'Chitkara Feedback statistics',
                               'width':500,
                               'height':500};

                // Instantiate and draw our chart, passing in some options.
                var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
                chart.draw(data, options);
              }
        
        });
        
    }
    
});