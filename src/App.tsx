import React, { useState, useEffect, useCallback, useMemo } from 'react';
import OpenAI from 'openai-api';


interface APIKeyWidgetProps {
  apiKey: string;
  setApiKey(apiKey: string): void;
}

function APIKeyWidget({ apiKey, setApiKey }: APIKeyWidgetProps) {

  useEffect(() => {
    const localKey = localStorage.getItem('openapi-key');
    if (localKey) {
      setApiKey(localKey);
    }
  }, [setApiKey]);

  useEffect(() => {
    localStorage.setItem('openapi-key', apiKey);
  }, [apiKey]);

  return <div>
    <input
      style={{
        position: 'absolute',
        right: '0px',
        top: '0px',
        width: '400px',
        fontSize: '20px',
      }}
      value={apiKey}
      onChange={ev => setApiKey(ev.target.value)}
    />
  </div>;
}


function App() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [sql, setSql] = useState('');
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  const queryDb = async (q: string) => {
    const response = await fetch('http://localhost:5000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: q,
        params: [],
      }),
    });
    return await response.json();
  };

  const openapi = useCallback(() => new OpenAI(apiKey), [apiKey]);

  const handleComplete = async () => {
    const response = await openapi().complete({
      engine: 'davinci',
      prompt:
`The schema has...

Album:
    AlbumId INTEGER
    Title VARCHAR
    ArtistId INTEGER

Artist:
    ArtistId INTEGER
    Name VARCHAR

Customer:
    CustomerId INTEGER
    FirstName VARCHAR
    LastName VARCHAR
    Company VARCHAR
    Address VARCHAR
    City VARCHAR
    State VARCHAR
    Country VARCHAR
    PostalCode VARCHAR
    Phone VARCHAR
    Fax VARCHAR
    Email VARCHAR
    SupportRepId

Employee:
    EmployeeId INTEGER
    LastName VARCHAR
    FirstName VARCHAR
    Title VARCHAR
    ReportsTo INTEGER
    BirthDate DATETIME
    HireDate DATETIME
    Address VARCHAR
    City VARCHAR
    State VARCHAR
    Country VARCHAR
    PostalCode VARCHAR
    Phone VARCHAR
    Fax VARCHAR
    Email VARCHAR

Genre:
    GenreId INTEGER
    Name VARCHAR

Invoice:
    InvoiceId INTEGER
    CustomerId INTEGER
    InvoiceDate DATETIME
    BillingAddress NVARCHAR
    BillingCity VARCHAR
    BillingState VARCHAR
    BillingCountry VARCHAR
    BillingPostalCode VARCHAR
    Total NUMERIC

InvoiceLine:
    InvoiceLineId INTEGER
    InvoiceId INTEGER
    TrackId INTEGER
    UnitPrice NUMERIC
    Quantity INTEGER

MediaType:
    MediaTypeId INTEGER
    Name VARCHAR

Playlist:
    PlaylistId INTEGER
    Name VARCHAR

PlaylistTrack:
    PlaylistId INTEGER
    TrackId INTEGER

Track:
    TrackId INTEGER
    Name VARCHAR
    AlbumId INTEGER,
    MediaTypeId INTEGER
    GenreId INTEGER
    Composer VARCHAR
    Milliseconds INTEGER
    Bytes INTEGER,
    UnitPrice NUMERIC

Generate SQLite queries for the following, making sure to use joins where appropriate:
Q: show me all the playlists
A: SELECT * FROM Playlist;
Q: show me the top 10 longest tracks
A: SELECT * FROM Track ORDER BY Milliseconds DESC LIMIT 10;
Q: ${query}
A:`,
      maxTokens: 60,
      temperature: 0,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
      bestOf: 1,
      n: 1,
      stream: false,
      stop: ['\n'],
    });
    const sql = response.data.choices[0].text;
    setSql(sql);
    const res = await queryDb(sql);
    setData(res);
  };

  return (
    <div
      style={{
        margin: '20px',
      }}
    >
      <h1>
        PlainQuery - Query your database with plain English
      </h1>
      <APIKeyWidget
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      <input
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          width: '400px',
          lineHeight: '30px',
        }}
        value={query}
        onChange={ev => setQuery(ev.target.value)}
        onKeyDown={ev => {
          if (ev.key === 'Enter') {
            handleComplete();
          }
        }}
      />
      {
        sql.length > 0 &&
        <div
          style={{
            border: 'thin solid lightgrey',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            margin: '10px',
          }}
        >
          {sql}
        </div>
      }
      { data &&
        <>
          <p>
            {data.length} results.
          </p>
          <table>
            <tbody>
              {
                data.map((e: any) => {
                  return <tr>
                    {
                      e.map((ee: any) => {
                        return <td>{ee}</td>
                      })
                    }
                  </tr>
                })
              }
            </tbody>
          </table>
        </>
      }
    </div>
  );
}

export default App;
