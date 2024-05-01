import type { NextApiRequest, NextApiResponse } from "next"
import {google} from 'googleapis'
import { env } from "~/env.js";

type SheetForm = {
    labell:string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests are allowed' });
    }

    const body = req.body as SheetForm;

    try {
        const auth = new google.auth.GoogleAuth({
            credentials:{
                client_email:env.GOOGLESHEETS_CLIENT_EMAIL,
                private_key:env.GOOGLESHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
            },
            scopes:['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.file']
        });

        const sheets = google.sheets({version:'v4',auth});

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId:env.GOOGLESHEETS_SHEET_ID,
            range:'A1:A1',
            valueInputOption:'USER_ENTERED',
            requestBody:{
                values:[[body.labell]]
            }
        });

        return res.status(200).json({
            data: response.data
        });

    } catch (error) {
        return res.status(500).json({
            error:'Something went wrong'
        });
    }

}
    