const fs = require('fs')
const path = require('path')
const R = require('ramda')

const { DrkBx } = require('./DarkBox')

const getCase = R.pipe(
    R.match(/\bcase\b.*?(\bwhen\b.*?\bthen\b.*?)+?\belse\b.*?(\bcase\b.*?(\bwhen\b.*?\bthen\b.*?)+?\belse\b.*?\bend\b.*?)\bend\b|\bcase\b.*?(\bwhen\b.*?\bthen\b.*?)+?\belse\b.*?\bend\b/gi),
    R.filter(R.test(/\bNull\b/gi))
)

const getCompare = txt => {
    if (/(?<!(select|set).*?)=([\s\n]|)\bnull\b/gi.test(txt)) {
        // return txt.match(
        //     /(\bwhere\b|\band\b|\bor\b|\bif\b)(|\s+)(@|)(\w+((\.|_|-)\w+|))*(|\s+)(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\s+\n+|)\bnull\b/gi
        // )
        // return txt.match(
        //     /(\bwhere\b((\s+|\n+|\s+\n+|)(?!.*?\bwhere\b).*?)*?|\bif\b((\n+|)(?!.*?\bif\b).*?)*?|\band\b((\n+|)(?!.*?\band\b).*?)*?|\bor\b((\n+|)(?!.*?\bor\b).*?)*?)(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi
        // )
        
        return {
            where: txt.match(/\bwhere\b((\s+|\n+|\s+\n+|)(?!.*?\bwhere\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi),
            and: txt.match(/\band\b((\s+|\n+|\s+\n+|)(?!.*?\band\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi),
            or: txt.match(/\bor\b((\s+|\n+|\s+\n+|)(?!.*?\bor\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi),
            if: txt.match(/\bif\b((\s+|\n+|\s+\n+|)(?!.*?\bif\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi)
        }

        // return {
        //     where: txt.match(/where(?:[^where]|\b(w(?!here)|wh(?!ere)|whe(?!re)|wher(?!e)|(?<!w)here|(?<!wh)ere|(?<!whe)re|(?<!wher)e)\b)*?=([\s\n]|)\bnull\b/gi),
        //     and: txt.match(/and(?:[^and]|\b(a(?!nd)|an(?!d)|(?<!a)nd|(?<!an)d)\b)*?=([\s\n]|)\bnull\b/gi),
        //     or: txt.match(/or(?:[^or]|\b(o(?!r)|(?<!o)r)\b)*?=([\s\n]|)\bnull\b/gi),
        //     if: txt.match(/if(?:[^if]|\b(i(?!f)|(?<!i)f)\b)*?=([\s\n]|)\bnull\b/gi)
        // }
    } else {
        return []
    }
}

const edit = R.curry( (coding, file) => {
    if (/(?<!(select|set).*?)=([\s\n]|)\bnull\b/gi.test( DrkBx.files.recode(coding, file))){
        fs.writeFileSync(
            'Data\\' + path.basename(file),
             R.replace(
                /\bif\b((\s+|\n+|\s+\n+|)(?!.*?\bif\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi,
                ' IS NULL ',
                R.replace(
                    /\bor\b((\s+|\n+|\s+\n+|)(?!.*?\bor\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi,
                    ' IS NULL ',
                    R.replace(
                        /\band\b((\s+|\n+|\s+\n+|)(?!.*?\band\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi,
                        ' IS NULL ',
                        R.replace(
                            /\bwhere\b((\s+|\n+|\s+\n+|)(?!.*?\bwhere\b)).*?(=|<>|>|<|>=|<=|!=|!<|!>)(\s+|\n+|\s+\n+|)\bnull\b/gi,
                            ' IS NULL ',
                            DrkBx.files.recode(coding , file)
                        )
                    )
                )
            )
        )
        return {
            file: file,
            case: getCase(
                DrkBx.files.recode(coding, file)
            ),
            compare: getCompare(
                DrkBx.files.recode(coding, file)
            )
        }
    }
    else {
        console.log('Hasn´t have \"= NULL\": ',path.basename(file))
        // return {
        //     file: file,
        //     status: 'Hasn´t have \"= NULL\"'
        // }
        return false
    }
})

const runFile = file => {
    console.log('Process: ',path.basename(file))
    if ( path.extname(file) == '.sql' ) { return edit( 'utf16le' )( file ) }
    else { return edit( 'latin1' )( file ) }
}

const filtEmptyResult = R.filter(obj => ( R.length( R.prop('case', obj) ) != 0
            &&  R.length( R.prop('compare', obj) ) != 0 ) )

const runDir = R.pipe(
    R.map(runFile),
    filtEmptyResult
)

const conctRootRunFiles = R.pipe( DrkBx.dir.conctDirIsFile, R.map(runFile) )

const runTheseFiles = R.pipe(
    conctRootRunFiles,
    filtEmptyResult
)

/* Usage */
const objsSQL3100 = 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL3100\\'
const objsSQL5000 = 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\'
// const dirOrig = 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\Intelisis5000\\Codigo Original\\'

/* Folder and extentions of the files */
fs.writeFileSync(
    'Report',
    JSON.stringify(
        R.filter(
            Boolean,
            runDir(
            DrkBx.dir.getFiltFilesAndOmit(
                ['.sql','.vis','.frm','.esp','.tbl','.rep','.dlg'],
                objsSQL5000,
                [
                    'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL3100\\dbo.spCrearJobsJasperTrabajo.StoredProcedure.sql',
                    // 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.spCrearJobsJasperTrabajo.StoredProcedure.sql',
                    // 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.spCorteCrearJobs.StoredProcedure.sql',
                    // 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.spCrearJobsSincroISTrabajo.StoredProcedure.sql',
                    // 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.speDocINCrearJobs.StoredProcedure.sql'
                
                ]
            )
        )
    )
    ).replace(/},/gm, '}\n\n').replace(/"(?=(case|compare)")/gi, '\n\n\"'),
    'Latin1'
)
// console.log(
//     R.filter(
//         Boolean,
//         runDir(
//         DrkBx.dir.getFiltFilesAndOmit(
//             ['.sql','.vis','.frm','.esp','.tbl','.rep','.dlg'],
//             objsSQL5000,
//             [
//                 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL3100\\dbo.spCrearJobsJasperTrabajo.StoredProcedure.sql',
//                 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.spCrearJobsJasperTrabajo.StoredProcedure.sql',
//                 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.spCorteCrearJobs.StoredProcedure.sql',
//                 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.spCrearJobsSincroISTrabajo.StoredProcedure.sql',
//                 'C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\ObjsSQL\\SQL5000\\dbo.speDocINCrearJobs.StoredProcedure.sql'
            
//             ]
//         )
//     )
// )

// )

module.exports.equalsNull = {
    runDir: runDir,
    runFile: runFile,
    runTheseFiles: runTheseFiles
}

/* Array of indicate files */
// console.log(
//     runTheseFiles([
//         'dbo.ActClave.Table.sql',
//         'dbo.AnexoCta.Table.sql',
//         'dbo.AjusteAnual.StoredProcedure.sql',
//         'AlmacenesVenta.frm'

//     ], 'Testing\\')
// )

/* One file */
// console.log(runFile('C:\\Users\\lapena\\Documents\\Luis Angel\\Sección Mavi\\Intelisis\\Intelisis5000\\Reportes MAVI\\ContSATComprobanteFaltante.frm'))
// console.log(runFile('Testing\\dbo.AjusteAnual.StoredProcedure.sql'))
