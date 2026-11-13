import { Pencil, Trash2 } from 'lucide-react-native';
import { type ComponentRef, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';

import { FeedFormLayout } from '../components/FeedFormLayout';
import { useFeedRequirementViewModel } from '../viewmodels/use-feed-requirement-view-model';

export default function FeedRequirementView() {
  const vm = useFeedRequirementViewModel();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  return (
    <>
      <FeedFormLayout title='Necessidade Alimentar' onBack={vm.goBack} scrollRef={scrollRef}>
        {vm.isLoading ? (
          <ActivityIndicator />
        ) : vm.hasError ? (
          <View className='gap-4'>
            <AppText color='error'>Não foi possível carregar as necessidades alimentares.</AppText>
            <Button onPress={vm.retry}>Tentar novamente</Button>
          </View>
        ) : !vm.group ? (
          <AppText color='muted'>Grupo de animais não encontrado.</AppText>
        ) : (
          <>
            <View>
              <AppText size='sm' weight='medium' className='uppercase'>{vm.group.name}</AppText>
              <AppText size='sm' color='muted' className='mt-3'>
                {vm.editingId ? 'Edite a necessidade alimentar' : 'Cadastre uma necessidade alimentar'}
              </AppText>
            </View>

            <View style={{ zIndex: 2 }}>
              <Controller control={vm.control} name='feedLocalId' render={({ field, fieldState }) => (
                <FormGroup label='Tipo de ração' required error={fieldState.error?.message}>
                  <Select
                    options={vm.feedOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Selecionar ração'
                    emptyMessage='Nenhuma ração disponível para adicionar.'
                    disabled={vm.isBusy}
                  />
                </FormGroup>
              )} />
            </View>

            <View className='gap-2'>
              <Controller control={vm.control} name='quantityKg' render={({ field, fieldState }) => (
                <FormGroup label='Quantidade' required error={fieldState.error?.message}>
                  <Input
                    ref={field.ref}
                    placeholder='4'
                    suffix='kg'
                    keyboardType='decimal-pad'
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    disabled={vm.isBusy}
                  />
                </FormGroup>
              )} />
              <AppText size='sm' color='muted'>Quantidade de quilos por animal por dia</AppText>
            </View>

            {vm.saveError && <AppText size='sm' color='error'>{vm.saveError}</AppText>}

            <View className='gap-3'>
              <Button onPress={() => { void vm.onSubmit(); }} isLoading={vm.isSaving} disabled={vm.isBusy || vm.feedOptions.length === 0}>
                {vm.editingId ? 'Salvar alterações' : 'Adicionar ração'}
              </Button>
              {vm.editingId && <Button variant='secondary' onPress={vm.cancelEdit} disabled={vm.isBusy}>Cancelar</Button>}
            </View>

            <View className='gap-3'>
              {vm.items.map((item) => (
                <View key={item.localId} className={`rounded-2xl border p-4 ${vm.editingId === item.localId ? 'border-forestGreen-400 bg-forestGreen-50' : 'border-gray-300 bg-white'}`}>
                  <View className='flex-row items-center gap-2'>
                    <View className='flex-1 gap-1'>
                      <AppText weight='medium'>{item.name}</AppText>
                      <AppText size='sm' color='muted'>{item.quantityPerAnimal} kg / animal / dia</AppText>
                      <AppText size='sm' color='muted'>{item.dailyTotal} kg / dia total</AppText>
                    </View>
                    <Button
                      variant='ghost' size='icon' leftIcon={Pencil}
                      accessibilityLabel={`Editar necessidade de ${item.name}`}
                      disabled={vm.isBusy || !item.canEdit}
                      onPress={() => { vm.startEdit(item.localId); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
                    />
                    <Button
                      variant='ghost' size='icon' leftIcon={Trash2}
                      accessibilityLabel={`Excluir necessidade de ${item.name}`}
                      disabled={vm.isBusy || !item.canEdit}
                      onPress={() => vm.requestDelete(item.localId)}
                    />
                  </View>
                  {item.lastSyncError && <AppText size='sm' color='error' className='mt-2'>{item.lastSyncError}</AppText>}
                </View>
              ))}
              {vm.items.length === 0 && <AppText size='sm' color='muted'>Nenhuma necessidade alimentar cadastrada.</AppText>}
            </View>
          </>
        )}
      </FeedFormLayout>
      <ConfirmDeleteModal
        visible={Boolean(vm.deletingItem)}
        title='Excluir necessidade alimentar?'
        description={vm.deleteError ?? `Deseja excluir a necessidade de ${vm.deletingItem?.name ?? ''} deste grupo?`}
        isDeleting={vm.isDeleting}
        onConfirm={vm.confirmDelete}
        onCancel={vm.cancelDelete}
      />
    </>
  );
}
