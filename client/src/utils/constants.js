// export const 

(()=>{
    console.log(process.env.REACT_APP_ENV)
})()

export const FETCH_DATA_API = process.env.REACT_APP_ENV !== "dev" ? "/api/nse/option-chain" : "/nse/option-chain"
export const CHANGE_MODE_API = process.env.REACT_APP_ENV !== "dev" ? "/api/nse/equities" : "/nse/equities"
export const GET_OPTION_CHAIN_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/option-chain" : "/analyze/option-chain"
export const DOWNLOAD_DATA_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/download" : "/analyze/download"
export const GET_UPTREND_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/uptrend" : "/analyze/uptrend"
export const GET_CONTENT_LENGTH_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/getContentLength" : "/analyze/getContentLength"
export const GET_OPTION_VALUES_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/options" : "/analyze/options"
export const GET_EXPIRY_DATES_API = process.env.REACT_APP_ENV !== "dev" ? "/api/nse/getOptionExpiries" : "/nse/getOptionExpiries"
export const GET_OPTION_RANK_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/getOptionRank" : "/analyze/getOptionRank"
export const SIGN_IN_API = process.env.REACT_APP_ENV !== "dev" ? "/api/login" : "/login"
export const SIGN_OUT_API = process.env.REACT_APP_ENV !== "dev" ? "/api/logout" : "/logout"
export const GET_SECTORS_API = process.env.REACT_APP_ENV !== "dev" ? "/api/analyze/getSectors" : "/analyze/getSectors"