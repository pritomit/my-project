<?php

// Video Player PHP Code

function displayVideoPlayer($videoUrl) {
    echo '<video width="640" height="360" controls>'; 
    echo '<source src="' . $videoUrl . '" type="video/mp4">'; 
    echo 'Your browser does not support the video tag.'; 
    echo '</video>';
}

displayVideoPlayer('path_to_your_video.mp4');

?>