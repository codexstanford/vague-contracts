var between0and100 = function (input)
{
    try
    {
        parseInt(input);
    }
    catch(NumberFormatException)
    {
        return false;
    }
    if(100 >= parseInt(input) && parseInt(input) >= 0 ) {
      return true;
    } else {
      return false;
    }
}

function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.trial = slide({
    name : "trial",
    present: exp.all_stims,
 
    // PRESENT THE SLIDE
    present_handle: function(stim) {
      this.trial_start = new Date();
      this.stim = stim;
      this.item = stim.item;
      this.version = stim.version;
      this.header = stim.header;
      this.continuation = stim.continuation;

      $("#vignette").html(this.header + "<p>" + this.continuation);
      $("#question").html('<i>1. Do you think that the damage was caused by ' + this.item + '?</i>');
      $("#error_percept").hide();
      $("#error_num").hide();
      // $("textarea").val("");
      // $("#firstpart").hide();
      // $("#attention_check").data("dont-show", true);
      // this.init_sliders();

    },


   // init_sliders : function() {
   //    utils.make_slider("#accent_slider", function(event, ui) {
   //      exp.sliderPost_accent = ui.value;
   //      //$("#number_guess").html(Math.round(ui.value*N));
   //    });
   //    utils.make_slider("#understand_slider", function(event, ui) {
   //      exp.sliderPost_understand = ui.value;
   //      //$("#number_guess").html(Math.round(ui.value*N));
   //    });
   //  },
    

    // CHECK THAT THEY MOVED ALL SLIDERS
    button_percept : function() {
    this.individual_judgment = $('input[name="individual_judgment"]:checked').val()
    this.population_judgment = $("#population_judgment").val()
    this.confidence = $("#confidence").val()
    if (this.individual_judgment === undefined || $("#confidence").val() == -1 || this.population_judgment === undefined) {
      $("#error_num").hide();
      $("#error_percept").show();
      if(!(between0and100(this.population_judgment))){
        $("#error_num").show();
      } 
    } else {
      $("#error_percept").hide();
      this.log_responses();
      _stream.apply(this);
      }
    },

    log_responses : function() {

      exp.data_trials.push({
          "individual_judgment" : this.individual_judgment,
          "population_judgment" : this.population_judgment,
          "confidence" : this.confidence,
          "item" : this.item,
          "version" : this.version,
          "header" : this.header,
          "continuation" : this.continuation,
          "time": (new Date()) - this.trial_start,
          "slide_number_in_experiment" : exp.phase,
          "response_accent": exp.sliderPost_accent,
          "response_understand": exp.sliderPost_understand,
        });
    }

  });

slides.subj_info =  slide({
    name : "subj_info",
    button_submit : function(e){
      if ($("#participant_id").val() == 0) {
        $("#error_emptyid").show();
      } else {
      exp.participant_id = $("#participant_id").val();
      // var raceData = new Array();
      // var raceQs = document.getElementById("checkboxes");
      // var chks = raceQs.getElementsByTagName("INPUT");
      // for (var i = 0; i < chks.length; i++) {
      //   if (chks[i].checked) {
      //     raceData.push(chks[i].value);
      //   }
      // };
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        // education : $("#education").val(),
        // affiliation : $("#affiliation").val(),
        // race : raceData.join(", "),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val()
      };
      exp.go();
      }
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "system" : exp.system,
          "hit_information" : exp.hit_data,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000,
          "participant_id" : exp.participant_id
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}


/// init ///
function init() {
  // var condition = _.sample(["List1","List2"]);
  // var condition = _.sample(["List1"]);

  exp.data_trials = [];

   //can randomize between subject conditions here
  // var stimlist = _.filter(stimuli, function(stim) {
  //   return stim.list == condition
  // })

  exp.all_stims = [_.sample(stimuli)];

  console.log(exp.all_stims);
 
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["i0", "instructions", "trial", "subj_info", "thanks"];

  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything



  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  $("#audio_player").bind("ended", function () {
        // if (! $("#attention_check").data("dont-show")) {
          // $("#attention_check").show();
          
        // }
        $("#audio_player").data("num-plays", $("#audio_player").data("num-plays") + 1);

      });

  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
