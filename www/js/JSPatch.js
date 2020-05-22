Number.prototype.add = function (arg) {
    var r1, r2, m;
    try {
        r1 = arg.toString().split(".")[1].length;
    } catch (e) { r1 = 0 }

    try {
        r2 = this.toString().split(".")[1].length;
    } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg * m + this * m) / m;
}
