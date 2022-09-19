import moment from 'moment-timezone'


export function utcToChile(date) {
    let newDate = moment.utc(date).tz('America/Santiago').format(`DD/MM/YYYY - HH:mm:ss A`)
    return newDate === "Invalid date" ? date : newDate
}