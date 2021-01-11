const DOMParser = require("dom-parser");

const parser = new DOMParser();
const parseAvailabilityResponse = DATAPAYLOAD => {
    const parsed = parser.parseFromString(DATAPAYLOAD.toLowerCase(), "text/xml");      // XML standard only supports lower case tags
    return parsed.getElementsByTagName("instockvalue")[0].childNodes[0].text;
}

module.exports = parseAvailabilityResponse;
// export default parseAvailabilityResponse;