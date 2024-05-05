function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

async function testHttpRequest(buttonId, requestUrl, resultDivId, buttonTxt) {
    const button = document.getElementById(buttonId);
    const resultDiv = document.getElementById(resultDivId);

    // Add spinner to button and disable it
    button.innerHTML = `Testing...<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
    button.disabled = true;
    
    try {
        const response = await axios.get(requestUrl);
        if (response.data.status === 'success') {
            const prettyJson = JSON.stringify(response.data.data, null, 4);
            resultDiv.innerHTML = `<div class="alert alert-success"><b>Request Succeeded:</b><br><pre class="hljs language-json rounded"><code>${prettyJson}</code></pre></div>`;
            updateScoreCookie(requestUrl, 'pass');
        } else {
            const errJson = JSON.stringify(response.data.error, null, 4);
            resultDiv.innerHTML = `<div class="alert alert-danger"><b>Request Failed:</b><br><pre class="hljs rounded"><code>${errJson}</code></pre></div>`;
            updateScoreCookie(requestUrl, 'fail');
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        updateScoreCookie(requestUrl, 'fail');
    } finally {
        // Restore original button text and remove spinner
        button.innerHTML = buttonTxt;
        button.disabled = false;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

async function testPostRequest(buttonId, requestUrl, resultDivId, inputDataId, buttonTxt) {
    const button = document.getElementById(buttonId);
    const resultDiv = document.getElementById(resultDivId);
    const inputData = document.getElementById(inputDataId).value;


    // Add spinner and change button text
    button.innerHTML = `Testing...<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
    button.disabled = true;

    try {
        const response = await axios.post(requestUrl, { userInput: inputData });
        if (response.data.status === 'success') {
            const prettyJson = JSON.stringify(response.data.data, null, 4);
            resultDiv.innerHTML = `<div class="alert alert-success"><b>Request Succeeded:</b><br><pre class="hljs language-json rounded"><code>${prettyJson}</code></pre></div>`;
            updateScoreCookie(requestUrl, 'pass');
        } else {
            const errJson = JSON.stringify(response.data.error, null, 4);
            resultDiv.innerHTML = `<div class="alert alert-danger"><b>Request Failed:</b><br><pre class="hljs rounded"><code>${errJson}</code></pre></div>`;
            updateScoreCookie(requestUrl, 'fail');
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        updateScoreCookie(requestUrl, 'fail');
    } finally {
        // Restore original button text
        button.innerHTML = buttonTxt;
        button.disabled = false;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
  
  function updateScoreCookie_old(requestUrl, status) {
    // Get the current cookie, decode it, and parse it as JSON
    const currentCookie = decodeURIComponent(getScoreCookie('mcnp_scoreboard') || '%7B%7D'); // Ensure the default value is an encoded empty JSON object
    let progress = JSON.parse(currentCookie);
    progress[encodeURIComponent(requestUrl)] = status;
    document.cookie = `mcnp_scoreboard=${encodeURIComponent(JSON.stringify(progress))}; path=/; expires=${new Date(new Date().getTime() + 86400e3).toUTCString()};`;
  }
  
  function getScoreCookie(name) {
    let cookieArray = document.cookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
      let cookiePair = cookieArray[i].split('=');
      if(name == cookiePair[0].trim()) {
        return cookiePair[1];
      }
    }
    return null;
  }

  function updateScoreCookie(requestUrl, status) {
    // Retrieve the existing score cookie or initialize it to an empty JSON object.
    // The cookie value retrieved is assumed to be URI-encoded since it was set as such.
    let currentCookie = getCookie('mcnp_scoreboard') || '{}';

    // Decode the retrieved cookie string to handle any URI-encoded characters.
    let decodedCookie = decodeURIComponent(currentCookie);

    // Parse the decoded cookie string into an object.
    let progress = JSON.parse(decodedCookie);

    // Update the progress object with the new status for the requestUrl.
    // Using encodeURIComponent to ensure the URL is safely encoded.
    progress[encodeURIComponent(requestUrl)] = status;

    // Serialize the progress object back into a JSON string.
    let jsonString = JSON.stringify(progress);

    // Encode the entire JSON string to ensure all special characters are URI-safe.
    let encodedJsonString = encodeURIComponent(jsonString);

    // Use the setCookie function to update the cookie with the URI-encoded JSON string.
    setCookie('mcnp_scoreboard', encodedJsonString, 1); // Set for 1 day expiration
}
