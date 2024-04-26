const User = function(data) {
    this.username = data.username;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.type = data.type;
    this.status = data.status;
    this.licence = data.licence;
};

module.exports = User;
