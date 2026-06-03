char* pCh1 = new char;
char* pCh2 = new char; 

std::cin >> *pCh1;

pCh2 = pCh1;
// pCh2 points now to the Ch1 memory cell
// The access to the memory cell of pCh2
// is now lost (memory leak!)

delete pCh1;
delete pCh2; 
// ERROR, already with pCh1 freed