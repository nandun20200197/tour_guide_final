async function request(url, method, data, callback) {


    let response;

    if (method.toUpperCase() === "GET"){
        if (!url.endsWith("/")){
            url = url + "/";
        }
        if (data !== null){
            url += "?"
            let keys = Object.keys(data);

            for (let i = 0; i < keys.length; i++){
                url += keys[i] + "=" + data[keys[i]];
                if (i < keys.length - 1){
                    url += "&";
                }
            }
        }

        response = await (await fetch(url)).json();

    }
    else {
        response = await (await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })).json();
    }

    console.log(response);

    if (response.alert !== null){
        alert(response.alert);
    }

    if (response.success){
        callback(response.data);
    }

    if (response.redirect !== null){
        window.location.href = response.redirect;
    }
}

function get_form_data(form, dont = []) {
    let data = {};
    let inputs = form.getElementsByTagName("input");
    for (let input of inputs) {
        if (dont.includes(input.name)) continue;

        if (input.files && input.files[0]) {
            data[input.name] = toBase64(input.files[0]);
        }else {
            let value = input.value;

            if(value.trim().length === 0){
                alert("Invalid input for " + input.name);
                return null;
            }
            data[input.name] = value;
        }

    }
    inputs = form.getElementsByTagName("select");
    for (let input of inputs) {
        let value = input.value;

        if(value.trim().length === 0){
            alert("Invalid selection for " + input.name);
            return null;
        }
        data[input.name] = value;
    }

    inputs = form.getElementsByTagName("textarea");
    for (let input of inputs) {
        let value = input.value;

        if(value.trim().length === 0){
            alert("Invalid selection for " + input.name);
            return null;
        }
        data[input.name] = value;
    }

    return data;
}
async function get_form_data_async(form,  dont = []) {
    let data = {};
    let inputs = form.getElementsByTagName("input");
    for (let input of inputs) {
        if (dont.includes(input.name)) continue;

        if (input.files && input.files[0]) {
            data[input.name] = await toBase64(input.files[0]);
        }else {
            let value = input.value;

            if(value.trim().length === 0){
                alert("Invalid input for " + input.name);
                return null;
            }
            data[input.name] = value;
        }

    }
    inputs = form.getElementsByTagName("select");
    for (let input of inputs) {
        let value = input.value;

        if(value.trim().length === 0){
            alert("Invalid selection for " + input.name);
            return null;
        }
        data[input.name] = value;
    }

    inputs = form.getElementsByTagName("textarea");
    for (let input of inputs) {
        let value = input.value;

        if(value.trim().length === 0){
            alert("Invalid selection for " + input.name);
            return null;
        }
        data[input.name] = value;
    }

    return data;
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});
