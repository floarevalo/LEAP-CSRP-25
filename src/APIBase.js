const REACT_APP_BACKEND_URL = `${window.location.origin}/api`; // use dynamic detection when hosting with nginx
    //process.env.REACT_APP_BACKEND_URL //use backend when hostin only on local device
export default REACT_APP_BACKEND_URL;