/**
 * app.js
 */



/**
 * Configuration
 */
(function(){
  var config = window.config = window.config || {};
  config.api = {
    baseUrl: 'http://euler.goodybag.com'
  };
})();



/**
 * Utility functions
 */
(function(){
  var utils = window.utils = window.utils || {};

  utils.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };

  utils.templatize = function(obj){
    var compiled = {};
    for (var key in obj){
      if (typeof obj[key] !== "string"){
        compiled[key] = compileTemplates(obj[key]);
      }else {
        // Create a function to be called (like other templating systems) for each template item
        compiled[key] = function(obj){
          var newHtml = this.html;
          for (var key in obj){
            newHtml = newHtml.replace(RegExp('{{' + key + '}}', 'g'), obj[key]);
          }
          return newHtml;
        }.bind({html: document.getElementById(obj[key]).innerHTML});
      }
    }
    return compiled;
  };

  utils.noop = function(){};
})();



/**
 * Template definitions
 */
(function(){
  var templates = window.templates = window.templates || {};

  templates.activity    = "activity-tmpl";
})();



/**
 * Api stuff
 */
(function(){
  var api = window.api = window.api || {};

  api.post = function(url, data, callback){
    if (typeof data === "function"){
      callback = data;
      data = {};
    }
    callback = callback || utils.noop;
    $.post(config.api.baseUrl + url, data, function(response){
      callback(response.error, response.data);
    });
  };

  api.get = function(url, data, callback){
    if (typeof data === "function"){
      callback = data;
      data = {};
    }
    callback = callback || utils.noop;
    $.get(config.api.baseUrl + url, data, function(response, responseType){
      callback(response.error, response.data);
    });
  };

  api.consumers = {};
  api.consumers.register = function(consumer, callback){
    api.post('/consumers', consumer, callback);
  };

  api.streams = {};
  api.streams.global = function(options, callback){
    api.get('/streams/global', options, callback);
  }
})();



/**
 * Domready
 */
$(function(){

  // Compile templates
  templates = utils.templatize(templates);



  /**
   * Logo Thingy
   */
  (function(){
    var
      // Logo element
      $el       = $('#logo')
      // Stores state for which position the logo is in
    , inNav     = false
      // The scrollY the logo triggers at
    , threshold = 0

      // Checks the above parameters and moves the logo accordingly
    , update = function(){
        if (window.scrollY > threshold && !inNav){
          inNav = true;
          $el.addClass('top-right');
        }else if (window.scrollY <= threshold && inNav){
          inNav = false;
          $el.removeClass('top-right');
        }
      }
    ;
    update();
    $(window).scroll(update);
  })();

  // Test update stream - This code no longer does anything but I'm too lazy to remove
  (function(){
    var
      // The test activity already in the DOM
      $el         = $('#activity-stream .getting-ready')
    , $clone      = $el.clone()
      // The activity wrapper
    , $wrapper    = $('#activity-stream .activity-wrapper')
    , height      = $el[0].offsetHeight
      // Needs to correspond to the transition time in main.css
    , transition  = 500
    ;

    setInterval(function(){
      $el.css({ top: -height + 8 + 'px', opacity: 1 });
      $wrapper.addClass('transition');
      $wrapper.css({
        transform: 'translate3d(0, ' + height + 'px, 0)'
      });
      setTimeout(function(){
        $wrapper.removeClass('transition');
        $wrapper.css({ transform: 'translate3d(0,0,0)' })
        $el.removeClass('getting-ready');
        $wrapper.prepend($el = $clone.clone());
      }, transition);
    }, 5000);
  })/*()*/; // Don't execute anymore



  /**
   * Registration
   */
  (function(){
    var
      // The signup form element
      $form = $('#sign-up-form')

      // Element for displaying errors
    , $errors = $('#sign-up-errors')

      // Regular expressions for validation
    , regs = {
        alpha: /[^a-z]/i
      , screenName: /[^a-z\.0-9_]/i
      , email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      }

      // Gets the data from the form
    , getData = function(){
        return {
          firstName:      $('#signup-firstName').val()
        , lastName:       $('#signup-lastName').val()
        , screenName:     $('#signup-screenName').val()
        , email:          $('#signup-email').val()
        , password:       $('#signup-password').val()
        , passwordAgain:  $('#signup-passwordAgain').val()
        }
      }

      // Validates form data return errors or passing them along to a callback
    , validate = function(data, callback){
        var errors = [], value;

        for (var key in data){
          value = data[key];

          switch (key){
            case 'firstName':
              if (value.length < 2)
                errors.push({ field: key, message: "First Name must be at least 2 characters" });
              if (regs.alpha.test(value))
                errors.push({ field: key, message: "First Name can only contain characters A-Z" });
            break;

            case 'lastName':
              if (value.length < 2)
                errors.push({ field: key, message: "Last Name must be at least 2 characters" });
              if (regs.alpha.test(value))
                errors.push({ field: key, message: "Last Name can only contain characters A-Z" });
            break;

            case 'screenName':
              if (value.length < 5)
                errors.push({ field: key, message: "Screen Name must be at least 5 characters" });
              if (regs.screenName.test(value))
                errors.push({ field: key, message: "Screen Name can only contain characters A-Z, periods, and underscores" });
            break;

            case 'email':
              // Only report one error of the same message
              if (value.length < 4){
                errors.push({ field: key, message: "Invalid email address" });
                break;
              }
              if (!regs.email.test(value))
                errors.push({ field: key, message: "Invalid email address" });
            break;

            case 'password': case 'passwordAgain':
              if (value.length < 5)
                errors.push({ field: key, message: "Password must be at least 5 characters" });
            break;

            default: break;
          }
        }

        if (data.password !== data.passwordAgain){
          errors.push({ field: 'password', message: 'Passwords do not match' });
          errors.push({ field: 'passwordAgain' });
        }

        return callback ? callback(errors) : errors;
      }

      // Displays an errors array above the form
    , handleErrors = function(errors){
        var $fragment = $();
        for (var i = 0, error, $errorEl; i < errors.length; i++){
          error = errors[i];
          if (error.message){
            $errorEl = $('<p class="text-error"></p>');
            $errorEl.html(error.message);
            $fragment = $fragment.add($errorEl);
          }
          $('#signup-' + error.field).parent().addClass('error');
        }
        $errors.html($fragment);
      }
    ;

    $form.on('submit', function(e){

      // Clear previous errors
      $errors.html("");
      $form.find('.error').removeClass('error');

      // Get data and validate
      var
        data    = getData()
      , errors  = validate(data)
      ;

      // Display errors if we have any
      if (errors && errors.length > 0) return handleErrors(errors);

      // Submit the data to the server
      api.consumers.register(data, function(error){
        if (error){
          $errors.html(templates.signUpError({ message: error.friendlyMessage || error.message }));
          return console.error(error);
        }

        // Clear the form
        $form.find('input').val('');

        // Show success message
        $('.pre-reg').addClass('hide');
        $('.post-reg').removeClass('hide');
      });
    });
  })();



  /**
   * Stream
   */
  (function(){
    var
      // The array that holds current data
      activityData

      // Interval that checks for new data
    , dataCheckInterval

      // How often to check for new data
    , dataCheckPeriod = 1000 * 5

      // Caches ids of stream items so we know which activies we have
    , ids = []

      // Needs to correspond to the transition time in main.css for
    , transition = 500

      // So much room for activities!
    , $activities = $('#activity-stream')

      // Returns a formatted date for the stream given an activity model
    , formatDate = function(attributes){
        var originalCalendar = moment.calendar, when;
        moment.calendar = {
          lastDay   : '[Yesterday at] LT',
          sameDay   : '[Today at] LT',
          nextDay   : '[Tomorrow at] LT',
          lastWeek  : '[last] dddd [at] LT',
          nextWeek  : '[on the upcoming] dddd [at] LT',
          sameElse  : '[on] L'
        };
        when = moment(new Date(attributes.when)).calendar();
        moment.calendar = originalCalendar;
        return when;
      }

      // Returns data ready for our template given an activity model
    , massageData = function(attributes){
        return {
          name:       (attributes.who && attributes.who.screenName) ? attributes.who.screenName : "Someone"
        , business:   attributes.where.org.name
        , charity:    attributes.data.charity.name
        , amount:     attributes.data.donationAmount
        , when:       formatDate(attributes)
        }
      }

      // Checks for new data and reacts accordingly
    , checkNewData = function(){
        api.streams.global({ skip: 0, limit: 5 }, function(error, data){
          if (error) return console.error(error);

          // No new data
          if (activityData[0] && data[0] && activityData[0]._id === data[0]._id) return;

          // We have new data
          var $newActivities = $();
          for (var i = 0; i < data.length; i++){
            // Done with new data
            if (ids.indexOf(data[i]._id) > -1) break;

            // Cache the id
            ids.push(data[i]._id);

            // Add to data list
            activityData.pop();
            activityData.unshift(data[i]);

            // Add the new activity html to the collection
            $newActivities = $newActivities.add(
              templates.activity(
                massageData(data[i])
              )
            );
          }

          addNewActivityEls($newActivities);
        });
      }

      // Given a jquery collection of activities it will add each item to the dom
    , addNewActivityEls = function($els){
        $els.each(function(i, $el){
          addNewActivityEl($($el), i);
        });
      }

      // Given a jquery object it will add an item to the dom
      // Optional index will offset the time - useful for adding multiple items in sequence
    , addNewActivityEl = function($el, index){
        index = index || 0;

        // Allow some time between each addition
        setTimeout(function(){
          // Put the element in the getting ready position and insert into the DOM
          $el.addClass('getting-ready');
          $activities.prepend($el);

          // The height is used to determine how much the list should move down
          var height = $el[0].offsetHeight;
          $el.css({ top: -height + 8 + 'px', opacity: 1 });

          // Get the activity list ready for animating
          $activities.addClass('transition');
          // Animate!
          $activities.css({
            transform: 'translate3d(0, ' + height + 'px, 0)'
          });

          // After the CSS transition is complete
          setTimeout(function(){
            // Clean up the animated stuff
            $activities.removeClass('transition');
            $activities.css({ transform: 'translate3d(0, 0, 0)' })
            $el.removeClass('getting-ready');

            // Remove the element that is now out of view
            var $els = $activities.find('.activity');
            $els.eq($els.length - 1).remove();
          }, transition);
        }, index * (transition + 100));
      }

      // Kicks everything off for stream stuff
    , init = function(){
        // Get initial data
        api.streams.global({ skip: 0, limit: 5 }, function(error, data){
          if (error) return console.error(error);

          // Cache initial dataset
          activityData = data;

          // Insert in DOM
          var $fragment = $();
          for (var i = 0; i < data.length; i++){
            // Cache the id
            ids.push(data[i]._id);

            // Add the new activity html to the collection
            $fragment = $fragment.add(
              templates.activity(
                massageData(data[i])
              )
            );
          }
          $activities.html($fragment);
        });

        // Periodically check for new Data
        dataCheckInterval = setInterval(checkNewData, dataCheckPeriod);
      }
    ;

    init(); // Here we goooooooo! - Mario64
  })();


  /**
   * Scroll to hash tag
   */
  (function(){
    $('a').click(function(e){
      var index;
      if ((index = e.target.href.indexOf('#')) > -1 && index !== e.target.href.length - 1){
        e.preventDefault();
        var
          hash  = e.target.href.substring(index + 1)
        , curr  = window.scrollY
        , pos   = $('#' + hash).offset().top - curr - 60 // padding for nav
        ;

        // Change hash
        if (history) history.pushState(null, null, '#' + hash);

        // Animate
        for (var step = 0, duration = 160; step < duration; step++){
          setTimeout(function(){
            window.scrollTo(0, utils.easeInOutQuad(step, curr, pos, duration));
          }, 1 * step);
        }
      }
    });
  })();
});
