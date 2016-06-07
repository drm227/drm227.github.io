require.config({
    paths: {
        text:       'text-2.0.12-min',
        jquery:     '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',
        knockout:   '//cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min'
    }
});


require(['knockout'], function(ko) {

    ko.components.register('timelapse',{require:'timelapse-slider'});

    function MainViewModel () {
        this.maps = [
            {url:'1855.png', caption:'1855 - Lechmere Point and Prison Point Bay'},
            {url:'1870.png', caption:'1870 - Lechmere Point and Prison Point Bay'},
            {url:'1880.png', caption:'1880 - Lechmere Point and Prison Point Bay'},
            {url:'1893.png', caption:'1893 - Lechmere Point and Prison Point Bay'},
            {url:'1903.png', caption:'1903 - Lechmere Triangle, Lechmere Canal and Millers River'},
            {url:'1954.png', caption:'1954 - Millers River, B&M Rail Yard, North Station'},
            {url:'1987.png', caption:'1987 - Lechmere Canal, Millers River, North Station platforms'}
        ];
        /*
        this.maps = [
            {url:'1987.png', caption:'1987 USGS: half of Lechmere Canal filled, Millers River covered, B&M rail yard shrinks'},
            {url:'1954.png', caption:'1954 USGS: Noth Station project made land and moved channel'},
            {url:'1903.png', caption:'1903 USGS: land made southeast and northeast of Lechmere Point'},
            {url:'1893.png', caption:'1893 USGS: note bay between Cambridge and Charlestown'}
        ];
        */
    }

    var viewModel = new MainViewModel();

    ko.applyBindings(viewModel);

    // For debugging, put a reference to the Knockout module in the global namespace.
    window.ko = ko;
});