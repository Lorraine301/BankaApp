import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { initialAccounts } from './src/data/accounts';
import { colors } from './src/theme/colors';

import DashboardScreen      from './src/screens/DashboardScreen';
import AccountDetailScreen  from './src/screens/AccountDetailScreen';
import TransferScreen       from './src/screens/TransferScreen';
import HistoryScreen        from './src/screens/HistoryScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Stack imbriqué dans l'onglet "Comptes" ─────────────────────────────────
function AccountsStack({ accounts, onDebit, onCredit, onTransfer, onReset }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: colors.primary },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Dashboard" options={{ title: 'Mes Comptes' }}>
        {(props) => (
          <DashboardScreen
            {...props}
            accounts={accounts}
            onReset={onReset}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AccountDetail" options={{ title: 'Détail du Compte' }}>
        {(props) => (
          <AccountDetailScreen
            {...props}
            accounts={accounts}
            onDebit={onDebit}
            onCredit={onCredit}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Transfer" options={{ title: 'Virement' }}>
        {(props) => (
          <TransferScreen
            {...props}
            accounts={accounts}
            onTransfer={onTransfer}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────
export default function App() {

  // État global des comptes
  const [accounts, setAccounts] = useState(initialAccounts);

  // ─── Tâche 1 — Correction du bug dans handleDebit ────────────────────────
  // AVANT (bugué) : utilisait .filter(Boolean) qui supprimait le compte en cas d'échec
  // APRÈS (corrigé) : on retourne l'objet account inchangé si le solde est insuffisant,
  //                   et on retourne false pour signaler l'échec à l'écran appelant.
  const handleDebit = (accountId, amount, label) => {
    let operationSuccess = true;

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id !== accountId) return acc;

        // Règle métier : rejet si solde insuffisant → compte conservé tel quel
        if (acc.balance < amount) {
          operationSuccess = false;
          return acc; // ← CORRECTION : on retourne le compte inchangé (pas null)
        }

        const newTransaction = {
          id:     'T' + Date.now(),
          type:   'debit',
          amount,
          label,
          date:   new Date().toLocaleDateString('fr-FR'),
        };
        return {
          ...acc,
          balance:      acc.balance - amount,
          transactions: [newTransaction, ...acc.transactions],
        };
      })
      // ← CORRECTION : pas de .filter(Boolean) — aucun compte ne doit être supprimé
    );

    return operationSuccess; // false si solde insuffisant, true si succès
  };

  // ─── Opération : Crédit ──────────────────────────────────────────────────
  const handleCredit = (accountId, amount, label) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id !== accountId) return acc;

        const newTransaction = {
          id:     'T' + Date.now(),
          type:   'credit',
          amount,
          label,
          date:   new Date().toLocaleDateString('fr-FR'),
        };
        return {
          ...acc,
          balance:      acc.balance + amount,
          transactions: [newTransaction, ...acc.transactions],
        };
      })
    );
    return true;
  };

  // ─── Tâche 2 — Implémentation de handleTransfer ──────────────────────────
  // Crée deux transactions : virement_sortant sur la source, virement_entrant sur la cible
  // Retourne false si le solde de la source est insuffisant
  const handleTransfer = (fromId, toId, amount, label) => {
    // Vérification du solde source avant de modifier l'état
    const sourceAccount = accounts.find(a => a.id === fromId);
    if (!sourceAccount || sourceAccount.balance < amount) {
      return false; // Rejet : solde insuffisant
    }

    const now       = new Date().toLocaleDateString('fr-FR');
    const timestamp = Date.now();

    setAccounts(prev =>
      prev.map(acc => {
        // Compte source → virement sortant
        if (acc.id === fromId) {
          const txSortant = {
            id:     'T' + timestamp + '_out',
            type:   'virement_sortant',
            amount,
            label:  label || `Virement vers ${accounts.find(a => a.id === toId)?.label}`,
            date:   now,
          };
          return {
            ...acc,
            balance:      acc.balance - amount,
            transactions: [txSortant, ...acc.transactions],
          };
        }

        // Compte destinataire → virement entrant
        if (acc.id === toId) {
          const txEntrant = {
            id:     'T' + timestamp + '_in',
            type:   'virement_entrant',
            amount,
            label:  label || `Virement depuis ${sourceAccount.label}`,
            date:   now,
          };
          return {
            ...acc,
            balance:      acc.balance + amount,
            transactions: [txEntrant, ...acc.transactions],
          };
        }

        return acc;
      })
    );

    return true; // Succès
  };

  // ─── Tâche 5 (Bonus) — Réinitialisation ────────────────────────────────
  // Remet tous les comptes à leur état initial (deep copy pour éviter les mutations)
  const handleReset = () => {
    setAccounts(JSON.parse(JSON.stringify(initialAccounts)));
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            borderTopColor: colors.border,
            height:         60,
            paddingBottom:  6,
          },
          headerShown: false,
        }}
      >
        {/* Onglet Comptes — contient un Stack Navigator */}
        <Tab.Screen
          name="AccountsTab"
          options={{
            tabBarLabel: 'Comptes',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>🏦</Text>
            ),
          }}
        >
          {() => (
            <AccountsStack
              accounts={accounts}
              onDebit={handleDebit}
              onCredit={handleCredit}
              onTransfer={handleTransfer}
              onReset={handleReset}
            />
          )}
        </Tab.Screen>

        {/* Onglet Historique */}
        <Tab.Screen
          name="HistoryTab"
          options={{
            tabBarLabel: 'Historique',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>📋</Text>
            ),
            headerShown:      true,
            headerStyle:      { backgroundColor: colors.primary },
            headerTintColor:  '#fff',
            headerTitleStyle: { fontWeight: '700' },
            title:            'Historique',
          }}
        >
          {() => <HistoryScreen accounts={accounts} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
