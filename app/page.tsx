import AuthBar from "./AuthBar";
import TrustCard from "./TrustCard";
import KioskStatus from "./KioskStatus";

export default function Home() {
  return (
    <main style={{minHeight:"100vh",background:"#f7f3ec",display:"flex",flexDirection:"column",paddingBottom:"80px",fontFamily:"Inter,sans-serif",width:"100%",maxWidth:"480px",margin:"0 auto"}}>

      <AuthBar />

      <header style={{background:"#f7f3ec",padding:"24px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(0,0,0,0.08)"}}>
        <div>
          <h1 style={{fontSize:"28px",fontWeight:"300",letterSpacing:"0.35em",color:"#1a1208",margin:0}}>BRAVO</h1>
          <p style={{fontSize:"10px",color:"#8a7f70",letterSpacing:"0.12em",marginTop:"2px"}}>Luxembourg · specialty coffee</p>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <button style={{background:"none",border:"none",fontSize:"20px",cursor:"pointer"}}>🔔</button>
          <button style={{background:"none",border:"none",fontSize:"20px",cursor:"pointer"}}>◎</button>
        </div>
      </header>

      <div style={{margin:"14px 16px 0",background:"white",borderRadius:"16px",border:"0.5px solid rgba(0,0,0,0.08)",overflow:"hidden"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
          <KioskStatus />
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:"22px",margin:0}}>⛅</p>
            <p style={{fontSize:"11px",color:"#8a7f70",margin:0}}>22 °C</p>
          </div>
        </div>
        <div style={{padding:"8px 16px",background:"rgba(251,191,36,0.08)"}}>
          <p style={{fontSize:"11px",color:"#92400e",margin:0}}>Zítra: 18 °C · možný déšť</p>
        </div>
      </div>

      <div style={{margin:"12px 16px 0",background:"#1a1208",borderRadius:"16px",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(184,149,74,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>🎵</div>
          <div>
            <p style={{fontSize:"12px",color:"#d4a96a",fontWeight:"500",margin:0}}>Bravo Rádio</p>
            <p style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",margin:0}}>Poslouchejte co hraje u kiosku</p>
          </div>
        </div>
        <button style={{width:"32px",height:"32px",borderRadius:"50%",background:"#b8954a",border:"none",color:"white",fontSize:"14px",cursor:"pointer"}}>▶</button>
      </div>

      <TrustCard />

      <div style={{margin:"12px 16px 0"}}>
        <button style={{width:"100%",background:"#1a1208",color:"#d4a96a",border:"none",borderRadius:"12px",padding:"14px",fontSize:"13px",fontWeight:"500",cursor:"pointer"}}>
          Objednat na nejbližší čas
        </button>
      </div>

      <div style={{margin:"16px 16px 0"}}>
        <p style={{fontSize:"9px",color:"#8a7f70",letterSpacing:"0.12em",margin:"0 0 8px"}}>DNEŠNÍ SPECIÁLNÍ NABÍDKA</p>
        <div style={{background:"white",borderRadius:"16px",border:"0.5px solid rgba(0,0,0,0.08)",overflow:"hidden"}}>
          <div style={{background:"#1a1208",padding:"8px 16px",display:"flex",justifyContent:"space-between"}}>
            <p style={{fontSize:"12px",color:"#d4a96a",fontWeight:"500",margin:0}}>Letní speciál</p>
            <p style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",margin:0}}>Dnes do 14:00</p>
          </div>
          <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{fontSize:"13px",fontWeight:"500",color:"#1a1208",margin:0}}>Ledový hibiscus + flat white</p>
              <p style={{fontSize:"11px",color:"#8a7f70",margin:"2px 0 0"}}>Ušetříte 1 euro</p>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:"11px",color:"#8a7f70",textDecoration:"line-through",margin:0}}>6,50 €</p>
              <p style={{fontSize:"13px",color:"#b8954a",fontWeight:"500",margin:0}}>5,50 €</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{margin:"14px 16px 0"}}>
        <p style={{fontSize:"9px",color:"#8a7f70",letterSpacing:"0.12em",margin:"0 0 8px"}}>VAŠE OBLÍBENÉ</p>
        {[
          {name:"Flat white",note:"méně sladké · oblíbené ♥",price:"3,50 €"},
          {name:"Hibiscus tea",note:"ledový",price:"3,00 €"},
        ].map(item => (
          <div key={item.name} style={{background:"white",borderRadius:"12px",border:"0.5px solid rgba(0,0,0,0.08)",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
            <div>
              <p style={{fontSize:"13px",fontWeight:"500",color:"#1a1208",margin:0}}>{item.name}</p>
              <p style={{fontSize:"10px",color:"#8a7f70",margin:"2px 0 0"}}>{item.note}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{fontSize:"13px",color:"#b8954a",fontWeight:"500"}}>{item.price}</span>
              <button style={{width:"28px",height:"28px",borderRadius:"50%",background:"#1a1208",color:"#d4a96a",border:"none",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          </div>
        ))}
      </div>

      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"480px",background:"#1a1208",borderTop:"0.5px solid rgba(255,255,255,0.07)",display:"flex"}}>
        {["DOMOV","MENU","KVETY","KOSIK","PROFIL"].map((tab,i) => (
          <button key={tab} style={{flex:1,padding:"10px 4px 14px",border:"none",background:"none",fontSize:"8px",letterSpacing:"0.06em",cursor:"pointer",color:i===0?"#d4a96a":"rgba(255,255,255,0.3)"}}>
            {tab}
          </button>
        ))}
      </nav>

    </main>
  );
}