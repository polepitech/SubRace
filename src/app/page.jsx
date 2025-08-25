import React from 'react';
import {Race} from './componants/Race'

function App({searchParams}) {

  const token = React.use(searchParams).TOKEN;
  
  if (token !== process.env.SECURE_PAGE) {
    return <></>
  }


  return (
    <Race/>
  )
}

export default App
