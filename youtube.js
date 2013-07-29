/*!
 
    YoutubeJS, a small javascript library that generates the possible
    links to download a youtube video. The script should be ran inside
    a youtube website with a video already running.

    This version supports downloading in the HTML5 trial and the
    flash version. The author recommends the users to register in the
    HTML5 trial at <https://youtube.com/html5> for a faster and better
    experience.

    Copyright (C) 2013 George Zakhour <http://george.zakhour.me>
    Released under the GPLv3 license
    http://www.gnu.org/licenses/gpl.txt

*/
(function youtubeJS() {

    // Checks if the user is in the HTML5 trial or uses flash
    var IS_HTML5        = document.getElementsByTagName("video").length > 0;
    var HTML_SCRIPT_TAG = 13; // the index of the script containing the URLs
    // The itag map, it maps the corresponding itag to the quality and format
    var ITAG_MAP        = {};
    ITAG_MAP[13]        = "Low Quality - 176x144 (.3gp)";
    ITAG_MAP[17]        = "Medium Quality - 176x144 (.3gp)";
    ITAG_MAP[36]        = "High Quality - 320x240 (.3gp)";
    ITAG_MAP[5]         = "Low Quality - 400x226 (.flv)";
    ITAG_MAP[6]         = "Medium Quality - 640x360 (.flv)";
    ITAG_MAP[34]        = "Medium Quality - 640x360 (.flv)";
    ITAG_MAP[35]        = "High Quality - 854x480 (.flv)";
    ITAG_MAP[43]        = "Low Quality - 640x360 (.webm)";
    ITAG_MAP[44]        = "Medium Quality - 854x480 (.webm)";
    ITAG_MAP[45]        = "High Quality - 1280x720 (.webm)";
    ITAG_MAP[46]        = "High Quality - 1280x720 (.webm)";
    ITAG_MAP[18]        = "Medium Quality - 480x360 (.mp4)";
    ITAG_MAP[22]        = "High Quality - 1280x720 (.mp4)";
    ITAG_MAP[37]        = "High Quality - 1920x1080 (.mp4)";
    ITAG_MAP[33]        = "High Quality - 4096x230 (.mp4)";
    // Regex to scan the document with
    REGEX               = {html: {}, flash: {}};
    // For flash
    REGEX.flash.stream  = /stream_map=(.[^&]*?)(?:\\\\|&)/i;
    REGEX.flash.itag    = /itag=(\d+)/;
    REGEX.flash.sig     = /sig=(.*?)&/;
    REGEX.flash.url     = /url=(.*?)&/;
    // For html
    REGEX.html.stream   = /stream_map"\s?:\s?"(.[^"]+)"/i;
    REGEX.html.itag     = /itag=(\d+)/;
    REGEX.html.sig      = /sig=(.[^\|]+)/;
    REGEX.html.url      = /url=(.*?)\|/;


    // Create and open the new tab
    download_info = IS_HTML5 ? get_html5_info() : get_flash_info();
    create_fill_placeholder(download_info);


    /**
     * If the user uses flash rather than HTML5, this function
     * will parse the flash vars and return the correspoding dictionary
     *
     * @return Object[]     same array as the one returned in info_from_stream(stream, regex);
    */
    function get_flash_info() {
        var html = document.body.innerHTML.match(REGEX.flash.stream)[0];
        return info_from_stream(html, REGEX.flash);
    }


    /**
     * If the user is in the HTML5 trial, this function
     * returns the an array of objects with the corresponding info
     *
     * @return Object[]     same array as the one returned in info_from_stream(stream, regex);
    */
    function get_html5_info() {
        var html = document.getElementsByTagName("script")[HTML_SCRIPT_TAG].innerHTML;
            html = html.match(REGEX.html.stream)[1];
            html = html.replace(/\\u0026/g, "|"); // to make things easier
        return info_from_stream(html, REGEX.html);
    }


    /**
     * Given the stream and the regex the function finds the links in the
     * stream string
     *
     * @param stream (String)   the stream that contains the url, itags...
     * @param regex  (Object)   Regex object that contains the regex of the URL,
     *                          Stream, itag and signature
     *
     * @return Object[]     an array of objects that hold the itag, url to download
     *                      the video, the signature of the video and a string
     *                      representing the quality
    */
    function info_from_stream(stream, regex) {
        if(regex === REGEX.flash)
            stream = decodeURIComponent(stream);

        var urls = stream.split(',');
        var download_info = [];

        for(url in urls) {
            url = urls[url];
            // Get all the info
            var video_info = {
                itag: url.match(regex.itag),
                sig:  url.match(regex.sig),
                url:  url.match(regex.url)
            };
            // Add the info if it is valid
            if(video_info.itag != null && video_info.url != null && video_info.sig != null) {
                video_info.itag = parseInt(video_info.itag[1]);
                video_info.url = unescape(video_info.url[1])+"&signature="+video_info.sig[1];
                video_info.quality = ITAG_MAP[video_info.itag];
                download_info.push(video_info);
            }
        }

        return download_info;
    }


    /**
     * The function creates a new window with a table filled 
     * with the data in info
     *
     * @param info (Object[])   the info is an array of objects with info about
     *                          the download
    */
    function create_fill_placeholder(info) {
        alert("YoutubeJS requires popus to be enabled. Please enable them if you haven't.\nA new window will open with the download links.");
        var download_window = window.open();
        // Fill the window with the HTML
        download_window.document.write("<html>");
        download_window.document.write("<head><title>YoutubeJS Downloader</title></head>");
        download_window.document.write("<body><table><tr><td><b>Quality</b></td><td><b>Link</b></td></tr>");
        for(var i=0;i<info.length;i++) {
            download_window.document.write("<tr><td>"+info[i].quality+"</td>");
            download_window.document.write("<td><a href='"+info[i].url+"' target='_blank'>"+info[i].url.substr(0, 100)+"...</a></td></tr>");
        }
        download_window.document.write("</table></body>");
        download_window.document.write("</html>");
    }


})();
