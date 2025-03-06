"use client"
import { NextPageContext } from 'next'

export default function Error({ statusCode }: { statusCode: number }) {
    return (
        <p>
            {statusCode
                ? `An error ${statusCode} occurred on server`
                : 'An error occurred on client'
            }
        </p>
    )
}

Error.getInitialProps = ({ res, err, ...context }: NextPageContext) => {
    if(res) {
        return { statusCode: res.statusCode }
    }
    return { statusCode: err ? err.statusCode :400 }
}
