function doNothing() {
    return;
}
module.exports = {
    fatal: doNothing,
    error: doNothing,
    warn: doNothing,
    info: doNothing,
    debug: doNothing,
    trace: doNothing
};
