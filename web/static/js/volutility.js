/**
 * Part of VolUtility
 */



function sessionCreate() {
    jQuery.noConflict();
    $('#sessionModal').modal('hide');
    spinnerControl('open', 'Cats are preparing your image for analysis');
}



// New Stuff Starts Here =========================================================================== //

/*
Download to file
Single Function to handle file downloads.

Params:
    command: str = name of command
    postFields: str(json) = json string of POST options
    spinner: Bool = Overlay a loading spinner or not.'
 */




/*
Plugin Table Filter:
Just a simple table filter

 */
$(document).ready(function() {

    (function($) {

        $('#pluginfilter').keyup(function() {

            var rex = new RegExp($(this).val(), 'i');
            $('.pluginsearch tr').hide();
            $('.pluginsearch tr').filter(function() {
                return rex.test($(this).text());
            }).show();

        })

    }(jQuery));

});
/*
SpinnerControl opens and closes the loading page
Not many plugins need to use this.

 */

function spinnerControl(state, message){
    if (state == 'open'){
        document.getElementById('loadingtext').innerHTML = message
       document.getElementById("spinnerdiv").style.width = "100%";
    } else {
        document.getElementById("spinnerdiv").style.width = "0%";
    }
}


/*
Alert Bar:
Generates a dismissable alert bar at the top of tha page.
Params:
    alertType: str = success or warning or danger or info
    strong: str = text in BOLD
    message: str = remainder of message

 */

function alertBar(alertType, strong, message){
    var alert_bar = '<div id="alert-bar" class="alert alert-' + alertType + ' alert-dismissible fade in text-center" role="alert"> \
                           <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                           <span aria-hidden="true">&times;</span> \
                           </button>\
                           <strong>' + strong + '</strong> ' + message + '\
                           </div>';

    $('#alertTarget').after(alert_bar);
    var session_id = $('#sessionID').html();
    ajaxHandler('pollplugins', {'session_id':session_id}, false );

}


/*
Notification Handler
add or remove notifications

Params:
    command: str = name of command
    postFields: str(json) = json string of POST options
    spinner: Bool = Overlay a loading spinner or not.'
 */

function notifications(notifyType, add, plugin_id, msg){
    if (add){
        if (notifyType == 'success'){
            // Increment the success counter
            var counter = parseInt($('#successcount').html());
            $('#successcount').html( counter+1);
            // Add the new li element

            var new_li = '<li><a href="#" onclick="ajaxHandler(\'pluginresults\', {\'plugin_id\':\'' + plugin_id + '\'}, false ); return false">'+ msg +'</a></li>';

            $('#notifysuccess').append(new_li)
        }
        if (notifyType == 'warning'){
            // Increment the success counter
            var counter = parseInt($('#warncount').html());
            $('#warncount').html( counter+1);
            // Add the new li element

            $('#notifywarn').append('<li><a href="#">'+ msg +'</a></li>');
        }
        if (notifyType == 'error'){
            // Increment the success counter
            var counter = parseInt($('#errorcount').html());
            $('#errorcount').html( counter+1);
            // Add the new li element
            $('#notifyerror').append('<li><a href="#">'+ msg +'</a></li>');
        }
    }else {
        if (notifyType == 'success'){
            // Reset
             $('#successcount').html(0);
            $('#notifysuccess').html('<li><a href="#" onclick="notifications(\'success\', false, \'\', \'Clear All\'); return false">Clear All</a></li>');
        }
        if (notifyType == 'warning'){
            // Reset
             $('#warncount').html(0);
            $('#notifywarn').html('<li><a href="#" onclick="notifications(\'warning\', false, \'\', \'Clear All\'); return false">Clear All</a></li>');
        }
            // Reset
             $('#errorcount').html(0);
            $('#notifyerror').html('<li><a href="#" onclick="notifications(\'error\', false, \'\', \'Clear All\'); return false">Clear All</a></li>');
        }
    var session_id = $('#sessionID').html();
    ajaxHandler('pollplugins', {'session_id':session_id}, false );
    }




/*
New Ajax Handler
Single Function to handle Ajax calls

Params:
    command: str = name of command
    postFields: str(json) = json string of POST options
    spinner: Bool = Overlay a loading spinner or not.'
 */


function ajaxHandler(command, postFields, spinner) {

    // Convert postFields to json
    if (typeof postFields != 'string'){
        postOptions = postFields
    } else {
        var postOptions = JSON.parse(postFields);
    }

    // Sometimes we need to get values from form fields before the post.
    if (command == 'plugin_dir'){
        var postOptions = {'plugin_dir':$('#pluginDir').val()};
    }

    if (command == 'yara'){
        postOptions['rule_file'] = $('#rule_file').val();
    }

    if (command == 'memhex' || command == 'memhexdump'){
        postOptions['start_offset'] = $('#start_offset').val();
        postOptions['end_offset'] = $('#end_offset').val();
    }

    if (command == 'searchbar'){
        postOptions['search_type'] = $('#search_type').val();
        postOptions['search_text'] = $('#search_text').val();

    }

    if (command == 'addcomment'){
        postOptions['comment_text'] = document.getElementById('commentText').value;
    }

    // if selected show the loading image
    if (spinner == true){
        spinnerControl('open', 'Loading Data');
    }

    // Set Plugin Running
    if (command == 'runplugin'){
        var span_id = document.getElementById(postFields['plugin_name']+'_glyph');
        span_id.removeAttribute('class');
        span_id.className += 'glyphicon glyphicon-repeat';
        span_id.className += ' gly-spin';
    }

    $.post("/ajaxhandler/" + command + "/", postOptions)

        // Success
        .done(function(data) {
            // POLL PLUGINS
            if (command == "pollplugins"){
                $('#pluginTable').html(data);

            // DROP PLUGINS
            } else if (command == "dropplugin"){
                notifications('warning', true, postOptions['plugin_id'], 'Plugin Deleted');

            // Run Plugin
            } else if (command == 'runplugin') {
                if (data.substring(0,5) == 'Error'){
                     notifications('error', true, postOptions['plugin_id'], 'View '+ data+ ' Output');
                } else if (data.substring(0,5) == 'Hmmmm') {
                    notifications('error', true, postOptions['plugin_id'], 'View '+ data+ ' Output');
                }else {

                notifications('success', true, postOptions['plugin_id'], 'View '+ data+ ' Output');
                }


            // Add Plugin Dir
            }else if (command == 'plugin_dir') {
                //alertBar('success', 'Added!', 'You have successfully added the plugin dir ' + data)
                location.reload();

            }else if (command == 'filedetails') {
                $('#fileModalDiv').html(data);
                jQuery.noConflict();
                $('#fileModal').modal('show');

            }else if (command == 'hivedetails') {
                $('#hiveModalDiv').html(data);
                jQuery.noConflict();
                spinnerControl('close', 'Loading Data');
                $('#hiveModal').modal('show');
                // Enable table sorting
                jQuery.noConflict();
                $('#hiveTable').DataTable();

            }else if (command == "virustotal" || command == "yara" || command == "strings") {
                $('#'+postOptions["target_div"]).html(data);

            }else if (command == "dropsession") {
                window.location.reload();

            }else if (command == 'memhex') {
                $('#'+postOptions["target_div"]).html(data);

            }else if (command == 'memhexdump') {
                var empty = true;

            }else if (command == 'addcomment') {
                $('#comment-block').html(data);

            }else if (command == 'pluginresults' || command == 'searchbar') {
                $('#resultsTarget').html(data);
                // Enable table sorting
                $('#resultsTable').DataTable();

            }else {
                alertBar('danger', 'Spaghetti-Os!', 'Unable to find a valid command')
            }

            // End of Done
        })
        // Failed
        .error(function(xhr, status) {
                if (xhr.status == 500) {
                    alertBar('danger', 'Spaghetti-Os!', 'Server Generated an Error 500 Please check the console. ' +
                        'Typically volitility couldnt handle a plugin correctly');
                }
            }

        )
        // CleanUp
        .always(function(xhr, status) {
               spinnerControl('close');
            }

        );
}
