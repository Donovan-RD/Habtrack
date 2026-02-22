import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null; // L'objet utilisateur (ou null si déconnecté)
  loading: boolean;  // Est-ce qu'on est en train de vérifier ?
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cette fonction de Firebase écoute les changements d'état (Connexion/Déconnexion)
    // Elle se lance toute seule au démarrage de l'app
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // On a fini de charger, on sait si on est connecté ou pas
    });

    // Nettoyage quand le composant est démonté
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder à l'auth partout
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};