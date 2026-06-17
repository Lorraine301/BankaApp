import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { colors } from '../theme/colors';
import TransactionItem from '../components/TransactionItem';

export default function AccountDetailScreen({
  route, navigation, accounts, onDebit, onCredit
}) {
  const { accountId } = route.params;

  // Récupérer le compte depuis la prop accounts (toujours à jour après chaque opération)
  const account = accounts.find(a => a.id === accountId);

  const [amount, setAmount] = useState('');
  const [label,  setLabel]  = useState('');
  const [mode,   setMode]   = useState(null); // 'debit' | 'credit' | null

  if (!account) {
    return <Text style={{ padding: 20 }}>Compte introuvable.</Text>;
  }

  // Tâche 3 — Indicateurs UX
  const isLowBalance  = account.balance < 1000;
  const isZeroBalance = account.balance === 0;

  const handleOperation = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));

    // Validations
    if (!label.trim()) {
      Alert.alert('Champ manquant', 'Veuillez saisir un libellé.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant positif.');
      return;
    }
    if (mode === 'debit' && numAmount > account.balance) {
      Alert.alert(
        'Solde insuffisant',
        `Votre solde est de ${account.balance.toLocaleString('fr-FR')} MAD.\nOpération rejetée.`
      );
      return;
    }

    // Tâche 3 — Confirmation différente selon le type d'opération
    const confirmTitle   = mode === 'debit' ? '↓ Confirmer le Débit' : '↑ Confirmer le Crédit';
    const confirmMessage = mode === 'debit'
      ? `Vous allez débiter ${numAmount.toLocaleString('fr-FR')} MAD de votre compte.\n\nLibellé : "${label}"`
      : `Vous allez créditer ${numAmount.toLocaleString('fr-FR')} MAD sur votre compte.\n\nLibellé : "${label}"`;

    Alert.alert(
      confirmTitle,
      confirmMessage,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: mode === 'debit' ? 'destructive' : 'default',
          onPress: () => {
            const success = mode === 'debit'
              ? onDebit(accountId, numAmount, label)
              : onCredit(accountId, numAmount, label);

            if (success === false) {
              Alert.alert(
                'Opération rejetée',
                'Solde insuffisant pour effectuer cette opération.'
              );
            } else {
              setAmount('');
              setLabel('');
              setMode(null);
              Alert.alert(
                '✅ Opération réussie',
                `${mode === 'debit' ? 'Débit' : 'Crédit'} de ${numAmount.toLocaleString('fr-FR')} MAD enregistré.`
              );
            }
          },
        },
      ]
    );
  };

  const toggleMode = (selectedMode) => {
    setMode(prev => (prev === selectedMode ? null : selectedMode));
    setAmount('');
    setLabel('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={account.transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        ListHeaderComponent={
          <View>
            {/* Solde du compte */}
            <View style={[
              styles.balanceBanner,
              isLowBalance && styles.balanceBannerWarning,
            ]}>
              <Text style={styles.accountName}>{account.label}</Text>
              <Text style={styles.balance}>
                {account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </Text>
              {/* Tâche 3 — Indicateur solde faible */}
              {isLowBalance && (
                <View style={styles.lowBalanceWarning}>
                  <Text style={styles.lowBalanceText}>
                    ⚠️ {isZeroBalance
                      ? 'Solde nul — aucun débit possible'
                      : 'Solde faible (< 1 000 MAD)'}
                  </Text>
                </View>
              )}
            </View>

            {/* Boutons d'action */}
            <View style={styles.actionsRow}>
              {/* Tâche 3 — Désactivation du bouton Débit si solde = 0 */}
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: isZeroBalance ? colors.textLight : colors.danger },
                  mode === 'debit' && styles.actionBtnActive,
                ]}
                onPress={() => !isZeroBalance && toggleMode('debit')}
                disabled={isZeroBalance}
                activeOpacity={isZeroBalance ? 1 : 0.75}
              >
                <Text style={styles.actionBtnText}>↓ Débit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.success },
                  mode === 'credit' && styles.actionBtnActive,
                ]}
                onPress={() => toggleMode('credit')}
              >
                <Text style={styles.actionBtnText}>↑ Crédit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Transfer', { fromAccountId: accountId })}
              >
                <Text style={styles.actionBtnText}>↗ Virement</Text>
              </TouchableOpacity>
            </View>

            {/* Formulaire inline débit/crédit */}
            {mode && (
              <View style={styles.form}>
                <Text style={[
                  styles.formTitle,
                  { color: mode === 'debit' ? colors.danger : colors.success }
                ]}>
                  {mode === 'debit' ? '↓ Nouveau Débit' : '↑ Nouveau Crédit'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Libellé de l'opération"
                  value={label}
                  onChangeText={setLabel}
                  placeholderTextColor={colors.textLight}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Montant en MAD"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textLight}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: mode === 'debit' ? colors.danger : colors.success }
                  ]}
                  onPress={handleOperation}
                >
                  <Text style={styles.submitBtnText}>Valider l'opération</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.historyTitle}>Historique des opérations</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune opération enregistrée.</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  balanceBanner:{
    backgroundColor: colors.primary,
    padding:         24,
    alignItems:      'center',
  },
  balanceBannerWarning: {
    backgroundColor: colors.warning,
  },
  accountName:  { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  balance:      { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 4 },
  lowBalanceWarning: {
    marginTop:       10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    8,
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  lowBalanceText: {
    color:      '#fff',
    fontSize:   12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    padding:        16,
    gap:            8,
  },
  actionBtn: {
    flex:            1,
    paddingVertical: 12,
    borderRadius:    10,
    alignItems:      'center',
  },
  actionBtnActive: {
    opacity: 0.75,
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  form: {
    backgroundColor: colors.card,
    margin:          16,
    borderRadius:    12,
    padding:         16,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    4,
    elevation:       3,
  },
  formTitle: {
    fontSize:     15,
    fontWeight:   '700',
    marginBottom: 12,
  },
  input: {
    borderWidth:       1,
    borderColor:       colors.border,
    borderRadius:      8,
    paddingHorizontal: 12,
    paddingVertical:   10,
    fontSize:          14,
    color:             colors.text,
    marginBottom:      10,
    backgroundColor:   colors.background,
  },
  submitBtn:     { borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  historyTitle: {
    fontSize:          13,
    color:             colors.textLight,
    paddingHorizontal: 16,
    paddingVertical:   12,
    textTransform:     'uppercase',
    letterSpacing:     0.8,
  },
  empty: { padding: 20, textAlign: 'center', color: colors.textLight },
});
