import SwiftUI
import ComposableArchitecture
import StoreKit

struct PaywallView: View {
    let store: StoreOf<PaywallFeature>
    
    var body: some View {
        WithViewStore(self.store, observe: { $0 }) { viewStore in
            ZStack {
                Theme.Colors.cream.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    HStack {
                        Spacer()
                        Button(action: { viewStore.send(.dismissButtonTapped) }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(Theme.Colors.textMuted)
                                .font(.title2)
                        }
                    }
                    .padding()
                    
                    VStack(spacing: 8) {
                        Text("Unlock Full Access")
                            .font(Theme.Fonts.display(size: 32))
                            .foregroundStyle(Theme.Colors.forest)
                        Text("Support your child's learning journey.")
                            .font(Theme.Fonts.body(size: 18))
                            .foregroundStyle(Theme.Colors.textMuted)
                    }
                    
                    Spacer()
                    
                    if viewStore.isLoading {
                        ProgressView()
                            .tint(Theme.Colors.forest)
                    } else if let error = viewStore.errorMessage {
                        VStack(spacing: 12) {
                            Text(error)
                                .font(Theme.Fonts.body(size: 14))
                                .foregroundStyle(.red)
                                .multilineTextAlignment(.center)
                            Button("Retry") { viewStore.send(.task) }
                                .font(Theme.Fonts.body(size: 16, weight: .bold))
                                .foregroundStyle(Theme.Colors.forest)
                        }
                        .padding()
                    }
                    
                    VStack(spacing: 16) {
                        ForEach(viewStore.products, id: \.id) { product in
                            Button(action: { viewStore.send(.purchaseButtonTapped(product)) }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(product.displayName)
                                            .font(Theme.Fonts.body(size: 20, weight: .bold))
                                            .foregroundStyle(Theme.Colors.text)
                                        Text(product.description)
                                            .font(Theme.Fonts.body(size: 14))
                                            .foregroundStyle(Theme.Colors.textMuted)
                                    }
                                    Spacer()
                                    Text(product.displayPrice)
                                        .font(Theme.Fonts.body(size: 20, weight: .bold))
                                        .foregroundStyle(Theme.Colors.forest)
                                }
                                .padding()
                                .background(Theme.Colors.white)
                                .clipShape(RoundedRectangle(cornerRadius: Theme.Layout.cornerRadiusCard))
                                .shadow(color: Theme.Layout.shadowCard.0, radius: Theme.Layout.shadowCard.1, x: Theme.Layout.shadowCard.2, y: Theme.Layout.shadowCard.3)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    Button("Restore Purchases") {
                        viewStore.send(.restoreButtonTapped)
                    }
                    .font(Theme.Fonts.body(size: 14))
                    .foregroundStyle(Theme.Colors.textMuted)
                    
                    Text("Subscriptions automatically renew. Cancel anytime.")
                        .font(Theme.Fonts.body(size: 12))
                        .foregroundStyle(Theme.Colors.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.bottom)
                }
            }
            .task {
                await viewStore.send(.task).finish()
            }
        }
    }
}
