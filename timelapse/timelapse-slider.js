define(['jquery', 'knockout'], function($, ko) {
    'use strict';

    function TimelapseViewModel (params) {
        this.frames = $.map(params.frames,function(frame, index){
            return new FrameViewModel(frame.url,frame.caption, index === 0 ? 1 : 0);
        });
        this.position = 0;
    }

    TimelapseViewModel.prototype.onChangePosition = function (vm, e) {
        var position = e.target.value,
            frame = Math.floor(position/10)+1,
            opacity = (position%10)/10;
        // Show all frames before the current one.
        for (var i = 0; i < frame; i++) {
            this.frames[i].opacity(1);
        }
        // Hide all frames after the current one.
        for (var i = frame+1; i < this.frames.length; i++) {
            this.frames[i].opacity(0);
        }
        // Set the opacity of the current frame proportional to the slider position.
        if (frame === this.frames.length) {
            this.frames[this.frames.length-1].opacity(1);
        }
        else if (frame > 0) {
            this.frames[frame].opacity(opacity);
        }
    };

    function FrameViewModel (url, caption, opacity) {
        this.src = url;
        this.caption = caption;
        this.opacity = ko.observable(opacity);
    }

    return {
        template: { require: 'text!timelapse-slider.html' },
        viewModel: TimelapseViewModel
    };
});
