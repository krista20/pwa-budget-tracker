let db = '';
const request = indexedDB.open('budgetTracker', 1)

request.onupgradeneeded = (evt) => {
    let budgetTransaction = evt.target.result
    budgetTransaction.createObjectStore('pending',{autoIncrement: true})
}

function addToDataBase() {
    const transaction = db.transaction(['pending'], 'readwrite');
    const newTransaction = transaction.objectStore('pending');
    const getAll = newTransaction.getAll();
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['pending'], 'readwrite');
            // access the tranaction object store
            const newTransaction = transaction.objectStore('pending');
            // clear all items in your store
            newTransaction.clear();
            alert('All saved transactions!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};



// on success
request.onsuccess = function(evt) {
    db = evt.target.result;
    if (navigator.onLine) {
        addToDataBase ()
    }
};

request.onerror = function(evt) {
    console.log(evt.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const newTransaction = transaction.objectStore('pending');
    newTransaction.add(record);
}
window.addEventListener('online', addToDataBase)