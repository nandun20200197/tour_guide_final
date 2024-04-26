class Response {

    alert;
    success;
    data;
    redirect;

    /**
     *
     * @param alert {string | undefined}
     * @param success {boolean}
     * @param data {{} | [] | undefined}
     * @param redirect {string | undefined}
     */
    constructor(alert,
                success,
                data,
                redirect) {
        this.alert = alert
        this.success = success
        this.data = data
        this.redirect = redirect
    }
}

module.exports = Response;
