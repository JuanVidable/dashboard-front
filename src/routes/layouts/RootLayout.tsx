import { Outlet } from "react-router-dom";
import "../../styles/Navbar.css"
import { Container } from "@mui/material";
import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "../../components/NavBar/Navbar";
import { getRol, setToken } from "../../services/TokenService";
import { EmpleadoService } from "../../services/EmpleadoService";
import { Empleado } from "../../types/Empresas/Empleado";
import { useAppDispatch } from "../../hooks/redux";
import { setSucursal } from "../../redux/slices/SucursalReducer";
import { setEmpresa } from "../../redux/slices/EmpresaReducer";

const RootLayout = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    redirectToPage();
  }, [isAuthenticated]);

  const redirectToPage = async () => {
    if(isAuthenticated) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          }
        })
  
        setToken(token);
        const roles = getRol();
  
        if(roles!=null) {
          if(roles.includes('ADMIN')) {
            navigate("admin-console")
          } else if(roles.includes('GERENTE')) {
            const service = new EmpleadoService();
            const auth0Id = user?.sub;
            if(auth0Id) {
              service.getUserByAuth0Id(auth0Id).then((empleado: any) => {
                let emp = empleado as Empleado;
                dispatch(setSucursal(emp.sucursal));
                dispatch(setEmpresa(emp.sucursal.empresa));
                console.log(emp.sucursal.empresa.id);
                navigate(`admin-console/sucursales/${emp.sucursal.empresa.id}`);
              })
            }
          } else if(roles.includes('COCINERO')) {
            navigate("cocinero-console")
          } else if(roles.includes('CAJERO')) {
            navigate("cajero-console")
          } else if(roles.includes('DELIVERY')) {
            navigate("delivery-console");
          } else {
            alert("Usuario no autorizado")
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
      <Container component="main" sx={{ flexGrow: 1, pl: 9, pt: 4}}>
        <Navbar/>
        <main className="w-100 d-flex justify-content-center align-items-center" >
          <Outlet/>
        </main>
      </Container>
  )
}

export default RootLayout;