export function getProgress(){
    return JSON.parse(localStorage.getItem('progress') || '{}');
  }
  export function unlock(id){
    const p = getProgress(); p[id]=true;
    localStorage.setItem('progress', JSON.stringify(p));
  }