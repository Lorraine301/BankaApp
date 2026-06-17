import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { colors } from '../theme/colors';

export default function TransferScreen({ route, navigation, accounts, onTransfer }) {
  const { fromAccountId } = route.params;

  const [toAccountId, setToAccountId] = useState(null);
  const [amount,      setAmount]      = useState('');
  const [label,       setLabel]       = useState('');

  // Compte source (pré-sélectionné)
  const sourceAccount = accounts.find(a => a.id === fromAccountId);

  // Comptes destinataires possibles (tous sauf le compte source)
  const targetAccounts = accounts.filter(a => a.id !== fromAccountId);

  if (!sourceAccount) {
    return <Text style={{ padding: 20 }}>Compte source introuvable.</Text>;
  }

  const selectedTarget = accounts.find(a => a.id === toAccountId);

  const handleTransfer = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));

    // Validations
    if (!toAccountId) {
      Alert.alert('Compte manquant', 'Veuillez sélectionner un compte destinataire.');
      return;
    }
    if (!label.trim()) {
      Alert.alert('Champ manquant', 'Veuillez saisir un libellé.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant positif.');
      return;
    }
    if (numAmount > sourceAccount.balance) {
      Alert.alert(
        'Solde insuffisant',
        `Votre solde est de ${sourceAccount.balance.toLocaleString('fr-FR')} MAD.\nVirement rejeté.`
      );
      return;
    }

    // Confirmation
    Alert.alert(
      '↗ Confirmer le Virement',
      `Vous allez virer ${numAmount.toLocaleString('fr-FR')} MAD\n\nDe : ${sourceAccount.label}\nVers : ${selectedTarget.label}\n\nLibellé : "${label}"`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider le virement',
          onPress: () => {
            const success = onTransfer(fromAccountId, toAccountId, numAmount, label);
            if (success === false) {
              Alert.alert('Erreur', 'Le virement a échoué. Vérifiez le solde du compte source.');
            } else {
              Alert.alert(
                '✅ Virement effectué',
                `${numAmount.toLocaleString('fr-FR')} MAD virés vers ${selectedTarget.label}.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Compte source (pré-sélectionné, non modifiable) */}
        <Text style={styles.sectionLabel}>COMPTE SOURCE</Text>
        <View style={styles.sourceCard}>
          <Text style={styles.sourceCardLabel}>{sourceAccount.label}</Text>
          <Text style={styles.sourceCardBalance}>
            Solde : {sourceAccount.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </Text>
        </View>

        {/* Flèche directionnelle */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>↓</Text>
        </View>

        {/* Sélection du compte destinataire */}
        <Text style={styles.sectionLabel}>COMPTE DESTINATAIRE</Text>
        <View style={styles.targetList}>
          {targetAccounts.map(acc => {
            const isSelected = acc.id === toAccountId;
            return (
              <TouchableOpacity
                key={acc.id}
                style={[styles.targetCard, isSelected && styles.targetCardSelected]}
                onPress={() => setToAccountId(acc.id)}
                activeOpacity={0.75}
              >
                <View style={styles.targetCardContent}>
                  <View style={styles.targetCardInfo}>
                    <Text style={[
                      styles.targetCardLabel,
                      isSelected && styles.targetCardLabelSelected
                    ]}>
                      {acc.label}
                    </Text>
                    <Text style={[
                      styles.targetCardBalance,
                      isSelected && styles.targetCardBalanceSelected
                    ]}>
                      {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
                    </Text>
                  </View>
                  <View style={[
                    styles.radioBtn,
                    isSelected && styles.radioBtnSelected
                  ]}>
                    {isSelected && <View style={styles.radioBtnInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>DÉTAILS DU VIREMENT</Text>

          <TextInput
            style={styles.input}
            placeholder="Libellé du virement"
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

          {/* Résumé si tout est rempli */}
          {selectedTarget && amount && parseFloat(amount) > 0 && (
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                💸 {parseFloat(amount).toLocaleString('fr-FR')} MAD seront virés vers{' '}
                <Text style={styles.summaryBold}>{selectedTarget.label}</Text>
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!toAccountId || !amount || !label) && styles.submitBtnDisabled,
            ]}
            onPress={handleTransfer}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>↗ Valider le virement</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { padding: 16, paddingBottom: 40 },

  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    color:         colors.textLight,
    letterSpacing: 0.8,
    marginBottom:  8,
    marginTop:     16,
  },

  // Compte source
  sourceCard: {
    backgroundColor: colors.primary,
    borderRadius:    12,
    padding:         16,
  },
  sourceCardLabel: {
    color:      '#fff',
    fontSize:   16,
    fontWeight: '700',
  },
  sourceCardBalance: {
    color:     'rgba(255,255,255,0.75)',
    fontSize:  13,
    marginTop: 4,
  },

  // Flèche
  arrowContainer: {
    alignItems:  'center',
    paddingVertical: 8,
  },
  arrow: {
    fontSize:  22,
    color:     colors.primary,
    fontWeight: '700',
  },

  // Comptes destinataires
  targetList: { gap: 8 },
  targetCard: {
    backgroundColor: colors.card,
    borderRadius:    12,
    padding:         14,
    borderWidth:     2,
    borderColor:     colors.border,
  },
  targetCardSelected: {
    borderColor:     colors.primary,
    backgroundColor: colors.primary + '08',
  },
  targetCardContent: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  targetCardInfo:    { flex: 1 },
  targetCardLabel:   { fontSize: 15, fontWeight: '600', color: colors.text },
  targetCardLabelSelected: { color: colors.primary },
  targetCardBalance: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  targetCardBalanceSelected: { color: colors.primary + 'AA' },

  // Radio button
  radioBtn: {
    width:        22,
    height:       22,
    borderRadius: 11,
    borderWidth:  2,
    borderColor:  colors.border,
    justifyContent: 'center',
    alignItems:     'center',
  },
  radioBtnSelected: { borderColor: colors.primary },
  radioBtnInner: {
    width:           11,
    height:          11,
    borderRadius:    6,
    backgroundColor: colors.primary,
  },

  // Formulaire
  form: { marginTop: 4 },
  input: {
    backgroundColor:   colors.card,
    borderWidth:       1,
    borderColor:       colors.border,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          15,
    color:             colors.text,
    marginBottom:      10,
  },

  // Résumé
  summary: {
    backgroundColor: colors.primary + '10',
    borderRadius:    8,
    padding:         12,
    marginBottom:    12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  summaryText:  { fontSize: 13, color: colors.primary },
  summaryBold:  { fontWeight: '700' },

  // Bouton valider
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius:    12,
    paddingVertical: 16,
    alignItems:      'center',
    marginTop:       8,
  },
  submitBtnDisabled: {
    backgroundColor: colors.textLight,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
