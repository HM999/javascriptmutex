// HM - a simple mutex class

const debug = true

class Mutex {

  constructor( mutexName ) {
    this.mutexName = mutexName
    this.queue = []
    this.holder = null
  }


  async aquire( who ) {
  
    if ( this.holder === who ) {
      throw `ERROR: ${who} wants to aquire mutex ${this.mutexName}, but already holds it.`
    }

    // it's free

    if ( ! this.holder ) {
      this.holder = who
      if ( debug ) console.log(`${who} aquired the mutex`)
      return Promise.resolve()
    }

    // have to wait

    if ( debug ) console.log(`${who} is in wait queue for the mutex`)

    const waiter = {}

    waiter.who = who

    waiter.promise = new Promise( (resolve, reject) => {
      waiter.resolve = resolve
      waiter.reject = reject
    }) 

    this.queue.push( waiter )

    return waiter.promise
  }


  release( who ) {

    if ( this.holder !== who ) {
      throw `ERROR: ${who} wants to release mutex ${this.mutexName}, but does not hold it.`
    }

    if ( debug ) console.log(`${this.holder} has released mutex`)

    if ( this.queue.length ) {
      const waiter = this.queue.shift()
      this.holder = waiter.who
      if ( debug ) console.log(`${this.holder} has aquired the released mutex`)
      waiter.resolve()
    } else {
      this.holder = null
      if ( debug ) console.log(`Mutex is free`)
    } 
  }

}

module.exports = Mutex

/***

const mutex = new Mutex( 'TESTMUTEX' )

async function doJob( who, seconds ) {

  await mutex.aquire( who )
  console.log( `Starting job ${who} running for ${seconds} seconds...` )
  await new Promise( resolve => { setTimeout( resolve, seconds*1000 ) } )
  console.log( `Finishing job ${who} ...` )
  mutex.release( who ) 

}

doJob( 'J1', 2 )
doJob( 'J2', 2 )
setTimeout( function(){ doJob( 'J3', 3) }, 1000 )
setTimeout( function(){ doJob( 'J4', 1) }, 2000 )

***/
